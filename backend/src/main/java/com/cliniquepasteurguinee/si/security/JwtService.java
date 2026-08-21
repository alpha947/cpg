package com.cliniquepasteurguinee.si.security;

import com.cliniquepasteurguinee.si.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final JwtProperties properties;
    private SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        String secret = properties.getSecret();
        if (secret == null || secret.isBlank()) {
            this.key = Jwts.SIG.HS256.key().build();
            log.warn("app.jwt.secret n'est pas configure : une cle de signature ephemere a ete generee. " +
                    "Toutes les sessions seront invalidees au redemarrage. Definissez JWT_SECRET en production.");
        } else {
            this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        }
    }

    public String generateAccessToken(UUID userId, String email, List<String> authorities) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.getAccessTokenTtlMinutes() * 60);
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("authorities", authorities)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getAccessTokenTtlSeconds() {
        return properties.getAccessTokenTtlMinutes() * 60;
    }
}
