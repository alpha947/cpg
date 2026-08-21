package com.cliniquepasteurguinee.si.bootstrap;

import com.cliniquepasteurguinee.si.config.SuperAdminProperties;
import com.cliniquepasteurguinee.si.domain.Role;
import com.cliniquepasteurguinee.si.domain.User;
import com.cliniquepasteurguinee.si.repository.RoleRepository;
import com.cliniquepasteurguinee.si.repository.UserRepository;
import com.cliniquepasteurguinee.si.service.PasswordPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SuperAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminInitializer.class);
    private static final String SUPER_ADMIN = "SUPER_ADMIN";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;
    private final SuperAdminProperties properties;

    public SuperAdminInitializer(UserRepository userRepository, RoleRepository roleRepository,
                                  PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy,
                                  SuperAdminProperties properties) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicy = passwordPolicy;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsEnabledSuperAdmin()) {
            return;
        }

        Role superAdminRole = roleRepository.findByName(SUPER_ADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "Le role SUPER_ADMIN est introuvable, verifiez les migrations Flyway"));

        String email = properties.getEmail().trim().toLowerCase();
        String configuredPassword = properties.getPassword();
        boolean generated = configuredPassword == null || configuredPassword.isBlank();
        String rawPassword = generated ? passwordPolicy.generateTemporaryPassword() : configuredPassword;

        if (!generated) {
            passwordPolicy.validate(rawPassword);
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setEmail(email);
        if (user.getFullName() == null) {
            user.setFullName("Super Administrateur");
        }
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setEnabled(true);
        user.setMustChangePassword(true);
        user.getRoles().add(superAdminRole);
        userRepository.save(user);

        log.warn("=================================================================");
        log.warn("Compte super-administrateur initialise : {}", email);
        if (generated) {
            log.warn("Mot de passe temporaire genere : {}", rawPassword);
            log.warn("Ce mot de passe ne sera plus jamais affiche. Connectez-vous puis changez-le immediatement.");
        } else {
            log.warn("Mot de passe defini via la variable SUPERADMIN_PASSWORD.");
        }
        log.warn("=================================================================");
    }
}
