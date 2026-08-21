package com.cliniquepasteurguinee.si.dto.user;

import com.cliniquepasteurguinee.si.domain.Permission;
import com.cliniquepasteurguinee.si.domain.User;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        boolean enabled,
        boolean mustChangePassword,
        List<String> roles,
        List<String> permissions,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        Set<Permission> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .collect(Collectors.toSet());
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isEnabled(),
                user.isMustChangePassword(),
                user.getRoles().stream().map(r -> r.getName()).sorted().collect(Collectors.toList()),
                permissions.stream().map(p -> p.getCode()).sorted().collect(Collectors.toList()),
                user.getCreatedAt()
        );
    }
}
