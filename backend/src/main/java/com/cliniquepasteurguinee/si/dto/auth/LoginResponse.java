package com.cliniquepasteurguinee.si.dto.auth;

import com.cliniquepasteurguinee.si.dto.user.UserResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
    public static LoginResponse of(String accessToken, long expiresIn, UserResponse user) {
        return new LoginResponse(accessToken, "Bearer", expiresIn, user);
    }
}
