package com.cliniquepasteurguinee.si.dto.user;

import com.cliniquepasteurguinee.si.domain.Role;

import java.util.List;
import java.util.stream.Collectors;

public record RoleResponse(
        Long id,
        String name,
        String description,
        List<String> permissions
) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getPermissions().stream()
                        .map(p -> p.getCode())
                        .sorted()
                        .collect(Collectors.toList())
        );
    }
}
