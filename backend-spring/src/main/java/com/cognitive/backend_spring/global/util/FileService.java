package com.cognitive.backend_spring.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        // 이미지 파일 체크 (NestJS의 fileFilter 대응)
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }

        try {
            // 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // 파일명 생성 (NestJS와 동일한 패턴: profile-고유값.확장자)
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());

            String extension = "";
            int dotIndex = originalName.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalName.substring(dotIndex);
            }
            if (file.getContentType().equals("image/webp")) extension = ".webp";

            String fileName = "profile-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;

            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/profiles/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("파일을 저장할 수 없습니다.", ex);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            // URL에서 파일명 추출하여 물리 경로 삭제
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("파일 삭제 실패: " + e.getMessage());
        }
    }
}
