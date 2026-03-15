package com.cognitive.backend_spring.global.auth;

import com.cognitive.backend_spring.domain.user.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;     // 로그인 아이디용
    private final String password;
    private final String name;      // 실제 사용자 이름 (추가)
    private final String nickname;  // 별명 (추가)
    private final String profileImage;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.name = user.getName();         // 엔티티의 name 저장
        this.nickname = user.getNickname(); // 엔티티의 nickname 저장
        this.profileImage = user.getProfileImage();
    }

    // Security 규약: 여기서는 식별자인 email을 반환
    @Override
    public String getUsername() {
        return email;
    } // 이메일을 아이디로 사용

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // 필요시 권한 추가
    }

    // 나머지 메서드(isAccountNonExpired 등)는 모두 return true;
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
