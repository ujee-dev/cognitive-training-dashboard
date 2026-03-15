package com.cognitive.backend_spring.domain.user.controller;

import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.dto.UserRequestDto;
import com.cognitive.backend_spring.domain.user.dto.UserResponseDto;
import com.cognitive.backend_spring.domain.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cognitive.backend_spring.global.auth.UserPrincipal;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, // 현재 로그인 유저 정보
            MultipartHttpServletRequest request) {

        UserRequestDto.UpdateProfile dto = new UserRequestDto.UpdateProfile();
        // getParameter는 ""을 null로 바꾸지 않고 그대로 가져옵니다.
        dto.setNickname(request.getParameter("nickname"));
        dto.setProfileImage(request.getParameter("profileImage"));

        MultipartFile file = request.getFile("file");
        if (file == null) file = request.getFile("profileImage");

        // principal.getUsername - email 반환
        User updatedUser = userService.updateProfile(principal.getUsername(), dto, file);
        return ResponseEntity.ok(new UserResponseDto(updatedUser));
    }

    /**
     * 비밀번호 변경
     * NestJS: @Post('password')
     */
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserRequestDto.ChangePassword dto
    ) {
        userService.changePassword(principal.getUsername(), dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 탈퇴
     * NestJS: @Delete('account')
     */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserRequestDto.DeleteAccount dto
    ) {
        userService.deleteAccount(principal.getUsername(), dto.getPassword());
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
    }
}
