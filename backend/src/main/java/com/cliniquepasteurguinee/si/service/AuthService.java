package com.cliniquepasteurguinee.si.service;

import com.cliniquepasteurguinee.si.config.JwtProperties;
import com.cliniquepasteurguinee.si.domain.LoginAudit;
import com.cliniquepasteurguinee.si.domain.RefreshToken;
import com.cliniquepasteurguinee.si.domain.User;
import com.cliniquepasteurguinee.si.dto.user.UserResponse;
import com.cliniquepasteurguinee.si.exception.AccountLockedException;
import com.cliniquepasteurguinee.si.exception.InvalidCredentialsException;
import com.cliniquepasteurguinee.si.exception.TooManyAttemptsException;
import com.cliniquepasteurguinee.si.repository.LoginAuditRepository;
import com.cliniquepasteurguinee.si.repository.RefreshTokenRepository;
import com.cliniquepasteurguinee.si.repository.UserRepository;
import com.cliniquepasteurguinee.si.security.JwtService;
import com.cliniquepasteurguinee.si.security.LoginRateLimiter;
import com.cliniquepasteurguinee.si.security.TokenHasher;
import com.cliniquepasteurguinee.si.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAuditRepository loginAuditRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;
    private final LoginRateLimiter rateLimiter;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                        LoginAuditRepository loginAuditRepository, JwtService jwtService, JwtProperties jwtProperties,
                        PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy, LoginRateLimiter rateLimiter) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAuditRepository = loginAuditRepository;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicy = passwordPolicy;
        this.rateLimiter = rateLimiter;
    }

    public record TokenPair(String accessToken, long expiresIn, String rawRefreshToken, UserResponse user) {
    }

    @Transactional
    public TokenPair login(String email, String rawPassword, String ip, String userAgent) {
        String normalizedEmail = email.trim().toLowerCase();
        if (!rateLimiter.isAllowed(ip + ":" + normalizedEmail)) {
            throw new TooManyAttemptsException("Trop de tentatives, reessayez dans quelques instants");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user != null && user.isLocked()) {
            audit(normalizedEmail, user.getId(), false, ip, userAgent);
            throw new AccountLockedException("Compte temporairement verrouille suite a plusieurs echecs. Reessayez plus tard.");
        }

        boolean success = user != null && user.isEnabled() && passwordEncoder.matches(rawPassword, user.getPasswordHash());

        if (!success) {
            if (user != null) {
                registerFailedAttempt(user);
            }
            audit(normalizedEmail, user != null ? user.getId() : null, false, ip, userAgent);
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        audit(normalizedEmail, user.getId(), true, ip, userAgent);

        return issueTokens(user, ip, userAgent);
    }

    @Transactional
    public TokenPair refresh(String rawRefreshToken, String ip, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidCredentialsException("Session expiree, veuillez vous reconnecter");
        }
        String hash = TokenHasher.hash(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash).orElse(null);

        if (stored == null) {
            throw new InvalidCredentialsException("Session expiree, veuillez vous reconnecter");
        }
        if (stored.isRevoked()) {
            log.warn("Reutilisation detectee pour un refresh token du compte utilisateur {}", stored.getUser().getId());
            refreshTokenRepository.revokeAllForUser(stored.getUser().getId(), Instant.now());
            throw new InvalidCredentialsException("Session invalidee, veuillez vous reconnecter");
        }
        if (!stored.isActive()) {
            throw new InvalidCredentialsException("Session expiree, veuillez vous reconnecter");
        }

        User user = stored.getUser();
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Compte desactive");
        }

        stored.setRevoked(true);
        stored.setRevokedAt(Instant.now());

        TokenPair pair = issueTokens(user, ip, userAgent);
        stored.setReplacedByTokenHash(TokenHasher.hash(pair.rawRefreshToken()));
        refreshTokenRepository.save(stored);

        return pair;
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(TokenHasher.hash(rawRefreshToken)).ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Mot de passe actuel incorrect");
        }
        passwordPolicy.validate(newPassword);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    private TokenPair issueTokens(User user, String ip, String userAgent) {
        UserPrincipal principal = new UserPrincipal(user);
        List<String> authorities = principal.getAuthorities().stream().map(a -> a.getAuthority()).toList();
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), authorities);

        String rawRefreshToken = TokenHasher.generateRawToken();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(TokenHasher.hash(rawRefreshToken));
        refreshToken.setExpiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshTokenTtlDays() * 24 * 3600));
        refreshToken.setIpAddress(ip);
        refreshToken.setUserAgent(userAgent);
        refreshTokenRepository.save(refreshToken);

        return new TokenPair(accessToken, jwtService.getAccessTokenTtlSeconds(), rawRefreshToken, UserResponse.from(user));
    }

    private void registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCK_DURATION));
            user.setFailedLoginAttempts(0);
        }
        userRepository.save(user);
    }

    private void audit(String email, UUID userId, boolean success, String ip, String userAgent) {
        loginAuditRepository.save(new LoginAudit(email, userId, success, ip, userAgent));
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));
        return UserResponse.from(user);
    }
}
