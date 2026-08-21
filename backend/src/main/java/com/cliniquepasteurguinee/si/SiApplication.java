package com.cliniquepasteurguinee.si;

import com.cliniquepasteurguinee.si.config.CorsProperties;
import com.cliniquepasteurguinee.si.config.JwtProperties;
import com.cliniquepasteurguinee.si.config.SecurityProperties;
import com.cliniquepasteurguinee.si.config.SuperAdminProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, SuperAdminProperties.class, SecurityProperties.class, CorsProperties.class})
public class SiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SiApplication.class, args);
	}

}
