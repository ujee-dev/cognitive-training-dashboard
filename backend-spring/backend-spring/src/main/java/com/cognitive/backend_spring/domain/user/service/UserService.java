package com.cognitive.backend_spring.domain.user.service;

import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.UserRepository;
import com.cognitive.backend_spring.domain.user.dto.UserRequestDto;
import com.cognitive.backend_spring.global.util.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FileService fileService;
    private final PasswordEncoder passwordEncoder; // SecurityConfig에 등록된 BCrypt 사용

    @Transactional
    public User updateProfile(String email, UserRequestDto.UpdateProfile dto, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));
        boolean hasUpdate = false;

        String currentPath = user.getProfileImage();
        String newProfilePath = currentPath;

        // 이미지 처리
        if (file != null && !file.isEmpty()) {
            fileService.deleteFile(currentPath);
            newProfilePath = fileService.storeFile(file);
            hasUpdate = true;
        }
        // 여기서 dto.getProfileImage()가 ""(빈값)이어야 삭제가 동작함
        else if ("".equals(dto.getProfileImage())) {
            if (currentPath != null) {
                fileService.deleteFile(currentPath);
                newProfilePath = null;
                hasUpdate = true;
            }
        }

        // 닉네임 처리 (null이 아니고, 기존과 다를 때만 업데이트)
        String newNickname = user.getNickname();
        if (dto.getNickname() != null && !dto.getNickname().trim().isEmpty()) {
            if (!newNickname.equals(dto.getNickname())) {
                newNickname = dto.getNickname();
                hasUpdate = true;
            }
        }

        if (!hasUpdate) {
            throw new IllegalArgumentException("수정할 내용이 없습니다.");
        }

        user.updateProfile(newNickname, newProfilePath);
        return user;
    }

    /**
     * 비밀번호 변경
     * NestJS: changePassword(userId, dto)
     */
    @Transactional
    public void changePassword(String email, UserRequestDto.ChangePassword dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));

        // 현재 비밀번호 검증 (bcrypt.compare)
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }
        // 새 비밀번호와 현재 비밀번호 동일 여부 체크
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.");
        }
        // (향후 프론트 구현되면)새 비밀번호와 확인용 비밀번호가 일치하는지 체크
        // if (!dto.getNewPassword().equals(dto.getNewPasswordConfirm())) {
        //     throw new IllegalArgumentException("새 비밀번호와 확인용 비밀번호가 일치하지 않습니다.");
        // }

        // 새 비밀번호 해싱 및 업데이트
        user.updatePassword(passwordEncoder.encode(dto.getNewPassword()));
    }

    /**
     * 회원 탈퇴
     * NestJS: deleteAccount(userId, dto)
     */
    @Transactional
    public void deleteAccount(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 프로필 이미지 물리 파일 삭제 (NestJS fs.unlinkSync 대응)
        if (user.getProfileImage() != null) {
            fileService.deleteFile(user.getProfileImage());
        }

        // DB 삭제
        userRepository.delete(user);
    }
}
