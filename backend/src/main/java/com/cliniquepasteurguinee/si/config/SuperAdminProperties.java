package com.cliniquepasteurguinee.si.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.superadmin")
public class SuperAdminProperties {

    private String email = "admin@cliniquepasteurguinee.com";
    /** Blank generates a random password, printed once to the startup log. */
    private String password = "";

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
