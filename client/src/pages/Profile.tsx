import React, { useState, useEffect } from "react";
import PageContainer from '../components/layout/PageContainer';
import { Button } from "../components/ui/Button";
import { authApi } from "../api/api";
import ProfileImageUpload from "../ui/profile/ProfileImageUpload";
import PasswordChangeForm from "../ui/profile/PasswordChangeForm";
import { useAuth } from "../auth/useAuth";
import CardToggle from "../components/ui/CardToggle";
import { showSuccess, showMessage } from "../ui/toast";
import { handleApiError } from "../api/handleApiError";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../auth/useAuthActions";
import { authBroadcast } from "../auth/authBroadcast";

export function Profile() {
  // useAuth로부터 전역 상태 관리 함수를 가져옵니다.
  const { user, setUser } = useAuth();
  const { logout } = useAuthActions();

  const [nickname, setNickname] = useState("");
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // 이미지 경로를 서버 주소와 결합해주는 헬퍼 함수
  const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    const baseUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    // 캐시 방지를 위해 쿼리 파라미터 추가 (선택 사항)
    return `${baseUrl}?t=${Date.now()}`; 
  };

  useEffect(() => {
    // user가 존재하고, 아직 초기화되지 않았을 때만 딱 한 번 실행
    if (user) {
      setNickname(user.nickname); // React 18 StrictMode의 의도적 과잉 경고: 무시
      setPreviewImage(getFullImageUrl(user.profileImage));
    }
  }, [user]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const formData = new FormData();
    formData.append('nickname', nickname);

    if (newProfileFile) {
      formData.append('profileImage', newProfileFile);
    } else if (!previewImage && user?.profileImage) {
      // 이미지 삭제 시 빈 문자열 전송
      formData.append('profileImage', ''); 
    }

    try {
      // 서버 응답 결과 (updatedUser)를 받음
      const updated = await authApi.updateProfile(formData); 
      
      // 내 탭의 상태 변경
      setUser(updated);
      setPreviewImage(getFullImageUrl(updated.profileImage));
      setNewProfileFile(null);
      
      // 다른 탭들에 최신 유저 정보 전송
      authBroadcast.send({ type: "profile-updated", payload: updated });

      showSuccess('회원정보가 수정되었습니다.');
    } catch (error) {
      handleApiError(error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDeletePassword(""); // 닫을 때 비밀번호 초기화
  };

  const onSubmitDelete = async () => {
    if (!deletePassword) return showMessage("비밀번호를 입력해주세요.");

    try {
      await authApi.deleteAccount({ password: deletePassword });
      setUser(null);
      localStorage.removeItem("accessToken");
      showSuccess("회원 탈퇴가 완료되었습니다.");
      
      logout(); // 전역 상태 정리: access/refresh 정리
      navigate("/", { replace: true }); // 뒤로가기로 돌아올 수 없게 replace 옵션을 주는 것이 좋습니다.
    } catch (error) {
      handleApiError(error);
    }
  };

  const inputStyle =
    "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <PageContainer>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-surface-900">회원 정보</h1>
        <p className="text-surface-500 font-medium">회원의 정보를 관리하세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-surface-500">이름</label>
          <p className="text-base font-bold text-surface-900">{user?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-surface-500">이메일 (ID)</label>
          <p className="text-base font-bold text-surface-900">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <CardToggle title="프로필 사진">
          <ProfileImageUpload
            profileImage={previewImage}
            onChangePreview={(file, preview) => { 
              setNewProfileFile(file); 
              setPreviewImage(preview); 
            }}
          />
        </CardToggle>

        <CardToggle title="비밀번호 변경">
          <PasswordChangeForm />
        </CardToggle>

        <div>
          <label className="block text-sm font-medium mb-3">닉네임</label>
          <input
            type="text"
            className={inputStyle}
            onChange={handleNicknameChange}
            required
            value={nickname}
          />
        </div>

        <Button
          onClick={handleUpdateProfile}
          variant="primary" 
          className="w-full h-11"
        >
          수정하기
        </Button>
      </div>

      {
        <div className="mt-16 border-t border-red-100 pt-8">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-red-600">위험 구역</h4>
              <p className="text-sm text-surface-500">
                계정을 삭제하면 다시 되돌릴 수 없습니다.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              회원 탈퇴
            </Button>
          </div>
        </div>
      }
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-bold text-surface-900 mb-5">
                정말 탈퇴하시겠습니까?
              </h2>
              <p className="text-surface-500 mb-6 leading-relaxed text-sm">
                계정을 삭제하면 모든 데이터가<br/>
                <strong>영구적으로 삭제되며 복구할 수 없습니다.</strong><br/>
                확인을 위해 비밀번호를 입력해주세요.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="현재 비밀번호를 입력하세요"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3 pt-2 justify-center">
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                    size="sm"
                  >
                    취소
                  </Button>
                  <Button
                    variant="danger"
                    onClick={onSubmitDelete}
                    size="sm"
                  >
                    탈퇴
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 하단 여백주기 */}
      <div className="h-12" />
    </PageContainer>
  );
}
