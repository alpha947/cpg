package com.cliniquepasteurguinee.si.service;

import com.cliniquepasteurguinee.si.domain.Role;
import com.cliniquepasteurguinee.si.domain.User;
import com.cliniquepasteurguinee.si.dto.user.CreateUserRequest;
import com.cliniquepasteurguinee.si.dto.user.CreateUserResponse;
import com.cliniquepasteurguinee.si.dto.user.UpdateUserRequest;
import com.cliniquepasteurguinee.si.dto.user.UserResponse;
import com.cliniquepasteurguinee.si.exception.ConflictException;
import com.cliniquepasteurguinee.si.exception.ForbiddenOperationException;
import com.cliniquepasteurguinee.si.exception.NotFoundException;
import com.cliniquepasteurguinee.si.repository.RefreshTokenRepository;
import com.cliniquepasteurguinee.si.repository.RoleRepository;
import com.cliniquepasteurguinee.si.repository.UserRepository;
import com.cliniquepasteurguinee.si.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String SUPER_ADMIN = "SUPER_ADMIN";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                        RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder,
                        PasswordPolicy passwordPolicy) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicy = passwordPolicy;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID id) {
        return UserResponse.from(findUserOrThrow(id));
    }

    @Transactional
    public CreateUserResponse createUser(CreateUserRequest request, UserPrincipal actor) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un utilisateur avec cet e-mail existe deja");
        }

        Set<Role> roles = resolveRoles(request.roleIds());
        ensureCanAssignRoles(roles, actor);

        String temporaryPassword = passwordPolicy.generateTemporaryPassword();

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setRoles(roles);
        user.setEnabled(true);
        user.setMustChangePassword(true);

        User saved = userRepository.save(user);
        return new CreateUserResponse(UserResponse.from(saved), temporaryPassword);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request, UserPrincipal actor) {
        User user = findUserOrThrow(id);
        boolean revokeSessions = false;

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }

        if (request.roleIds() != null) {
            Set<Role> newRoles = resolveRoles(request.roleIds());
            ensureCanAssignRoles(newRoles, actor);
            if (user.hasRole(SUPER_ADMIN) && newRoles.stream().noneMatch(r -> r.getName().equals(SUPER_ADMIN))) {
                ensureNotLastSuperAdmin(user);
            }
            user.setRoles(newRoles);
            revokeSessions = true;
        }

        if (request.enabled() != null && request.enabled() != user.isEnabled()) {
            if (!request.enabled()) {
                if (user.getId().equals(actor.getId())) {
                    throw new ForbiddenOperationException("Vous ne pouvez pas desactiver votre propre compte");
                }
                if (user.hasRole(SUPER_ADMIN)) {
                    ensureNotLastSuperAdmin(user);
                }
            }
            user.setEnabled(request.enabled());
            revokeSessions = true;
        }

        User saved = userRepository.save(user);
        if (revokeSessions) {
            refreshTokenRepository.revokeAllForUser(saved.getId(), Instant.now());
        }
        return UserResponse.from(saved);
    }

    @Transactional
    public String resetPassword(UUID id) {
        User user = findUserOrThrow(id);
        String temporaryPassword = passwordPolicy.generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        return temporaryPassword;
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private Set<Role> resolveRoles(Set<Long> roleIds) {
        Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
        if (roles.size() != roleIds.size()) {
            throw new NotFoundException("Un ou plusieurs roles sont introuvables");
        }
        return roles;
    }

    private void ensureCanAssignRoles(Set<Role> roles, UserPrincipal actor) {
        boolean assignsSuperAdmin = roles.stream().anyMatch(r -> r.getName().equals(SUPER_ADMIN));
        boolean actorIsSuperAdmin = actor.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + SUPER_ADMIN));
        if (assignsSuperAdmin && !actorIsSuperAdmin) {
            throw new ForbiddenOperationException("Seul un super administrateur peut attribuer ce role");
        }
    }

    private void ensureNotLastSuperAdmin(User user) {
        if (userRepository.countEnabledSuperAdmins() <= 1) {
            throw new ForbiddenOperationException("Impossible de retirer le dernier super administrateur actif");
        }
    }
}
