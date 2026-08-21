package com.cliniquepasteurguinee.si.controller;

import com.cliniquepasteurguinee.si.dto.user.CreateUserRequest;
import com.cliniquepasteurguinee.si.dto.user.CreateUserResponse;
import com.cliniquepasteurguinee.si.dto.user.UpdateUserRequest;
import com.cliniquepasteurguinee.si.dto.user.UserResponse;
import com.cliniquepasteurguinee.si.security.UserPrincipal;
import com.cliniquepasteurguinee.si.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('USERS_MANAGE')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> list() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable UUID id) {
        return userService.getUser(id);
    }

    @PostMapping
    public ResponseEntity<CreateUserResponse> create(@Valid @RequestBody CreateUserRequest request,
                                                       @AuthenticationPrincipal UserPrincipal actor) {
        return ResponseEntity.ok(userService.createUser(request, actor));
    }

    @PatchMapping("/{id}")
    public UserResponse update(@PathVariable UUID id, @RequestBody UpdateUserRequest request,
                                @AuthenticationPrincipal UserPrincipal actor) {
        return userService.updateUser(id, request, actor);
    }

    @PostMapping("/{id}/reset-password")
    public ResetPasswordResponse resetPassword(@PathVariable UUID id) {
        return new ResetPasswordResponse(userService.resetPassword(id));
    }

    public record ResetPasswordResponse(String temporaryPassword) {
    }
}
