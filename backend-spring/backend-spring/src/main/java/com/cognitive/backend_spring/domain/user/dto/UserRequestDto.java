package com.cognitive.backend_spring.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public class UserRequestDto {
    @Getter
    @Setter
    public static class UpdateProfile {
        private String nickname;
        private String profileImage; // 삭제 시 ""(빈 문자열) 전달됨
    }

    @Getter @Setter
    public static class ChangePassword {
        @NotBlank(message = "현재 비밀번호는 필수 입력 항목입니다.")
        private String currentPassword;

        @NotBlank(message = "새 비밀번호는 필수 입력 항목입니다.")
        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
                message = "비밀번호는 영문과 숫자를 포함해야 합니다.")
        private String newPassword;
    }

    @Getter @Setter
    public static class DeleteAccount {
        @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
        private String password;
    }
}
