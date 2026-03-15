package com.cognitive.backend_spring.domain.user.dto;

import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.global.auth.UserPrincipal;
import lombok.Getter;

@Getter
public class UserResponseDto {
    private String id;
    private String email;
    private String name;
    private String nickname;
    private String profileImage;

    // 기존 엔티티용 생성자
    public UserResponseDto(User user) {
        this.id = user.getId().toString();
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
    }
}
