package com.cognitive.backend_spring.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // PostgreSQL의 'user'는 예약어일 수 있어 'users'로 권장
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // MongoDB의 ObjectId 대신 Long 타입의 PK 사용

    @Column(nullable = false)
    private  String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // bcrypt 해시값 저장

    @Column(nullable = false)
    private String nickname;

    private String profileImage;

    // Refresh Token: 보안상 TEXT 타입으로 지정 (길이 제한 방지)
    @Column(columnDefinition = "TEXT")
    private String currentHashedRefreshToken; // null 허용, 초기값 null

    @Builder
    public User(String email, String password, String name, String nickname, String profileImage) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void setCurrentHashedRefreshToken(String currentHashedRefreshToken) {
        this.currentHashedRefreshToken = currentHashedRefreshToken;
    }

    public void updateProfile(String nickname, String profileImage) {
        if (nickname != null) this.nickname = nickname;
        this.profileImage = profileImage; // null 또는 새 경로
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
