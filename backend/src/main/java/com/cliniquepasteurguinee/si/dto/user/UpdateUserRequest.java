package com.cliniquepasteurguinee.si.dto.user;

import java.util.Set;

public record UpdateUserRequest(
        String fullName,
        Set<Long> roleIds,
        Boolean enabled
) {
}
