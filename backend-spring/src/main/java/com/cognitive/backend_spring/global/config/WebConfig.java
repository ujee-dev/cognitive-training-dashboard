package com.cognitive.backend_spring.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir}")
    private String uploadDir; // application.yml의 ./uploads/profiles

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 클라이언트가 /uploads/profiles/** 로 시작하는 URL로 접근하면
        registry.addResourceHandler("/uploads/profiles/**")
                // 실제 서버의 물리적 디렉토리 경로로 연결
                .addResourceLocations("file:" + Paths.get(uploadDir).toAbsolutePath().toString() + "/");
    }
}
