package com.cliniquepasteurguinee.si.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.regex.Pattern;

@Component
public class PasswordPolicy {

    private static final int MIN_LENGTH = 10;
    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    private static final String CHARS_LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String CHARS_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String CHARS_DIGIT = "23456789";
    private static final String CHARS_SPECIAL = "!@#$%^&*-_=+";
    private static final SecureRandom RANDOM = new SecureRandom();

    public void validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins " + MIN_LENGTH + " caracteres");
        }
        if (!UPPER.matcher(password).find() || !LOWER.matcher(password).find()
                || !DIGIT.matcher(password).find() || !SPECIAL.matcher(password).find()) {
            throw new IllegalArgumentException(
                    "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractere special");
        }
    }

    public String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(16);
        sb.append(pick(CHARS_UPPER)).append(pick(CHARS_LOWER)).append(pick(CHARS_DIGIT)).append(pick(CHARS_SPECIAL));
        String all = CHARS_LOWER + CHARS_UPPER + CHARS_DIGIT + CHARS_SPECIAL;
        for (int i = sb.length(); i < 16; i++) {
            sb.append(pick(all));
        }
        return shuffle(sb.toString());
    }

    private char pick(String source) {
        return source.charAt(RANDOM.nextInt(source.length()));
    }

    private String shuffle(String input) {
        char[] chars = input.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }
        return new String(chars);
    }
}
