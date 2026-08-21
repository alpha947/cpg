package com.cliniquepasteurguinee.si.dto.user;

public record CreateUserResponse(
        UserResponse user,
        String temporaryPassword
) {
}
