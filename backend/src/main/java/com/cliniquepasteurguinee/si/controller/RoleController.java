package com.cliniquepasteurguinee.si.controller;

import com.cliniquepasteurguinee.si.dto.user.RoleResponse;
import com.cliniquepasteurguinee.si.service.RoleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USERS_MANAGE', 'ROLES_VIEW')")
    public List<RoleResponse> list() {
        return roleService.listRoles();
    }
}
