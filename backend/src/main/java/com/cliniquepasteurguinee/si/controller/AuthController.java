package com.cliniquepasteurguinee.si.controller;

import com.cliniquepasteurguinee.si.config.JwtProperties;
import com.cliniquepasteurguinee.si.config.SecurityProperties;
import com.cliniquepasteurguinee.si.dto.auth.ChangePasswordRequest;
import com.cliniquepasteurguinee.si.dto.auth.LoginRequest;
import com.cliniquepasteurguinee.si.dto.auth.LoginResponse;
import com.cliniquepasteurguinee.si.dto.user.UserResponse;
import com.cliniquepasteurguinee.si.security.UserPrincipal;
import com.cliniquepasteurguinee.si.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final JwtProperties jwtProperties;
    private final SecurityProperties securityProperties;

    public AuthController(AuthService authService, JwtProperties jwtProperties, SecurityProperties securityProperties) {
        this.authService = authService;
        this.jwtProperties = jwtProperties;
        this.securityProperties = securityProperties;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        AuthService.TokenPair tokens = authService.login(request.email(), request.password(),
                httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        return withRefreshCookie(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
                                                  HttpServletRequest httpRequest) {
        AuthService.TokenPair tokens = authService.refresh(refreshToken, httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));
        return withRefreshCookie(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        ResponseCookie expired = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(securityProperties.isCookieSecure()).sameSite("Strict")
                .path(REFRESH_COOKIE_PATH).maxAge(0).build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expired.toString()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.currentUser(principal.getId()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<LoginResponse> withRefreshCookie(AuthService.TokenPair tokens) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, tokens.rawRefreshToken())
                .httpOnly(true)
                .secure(securityProperties.isCookieSecure())
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ofDays(jwtProperties.getRefreshTokenTtlDays()))
                .build();
        LoginResponse body = LoginResponse.of(tokens.accessToken(), tokens.expiresIn(), tokens.user());
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(body);
    }
}
