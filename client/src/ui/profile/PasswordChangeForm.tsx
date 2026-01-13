import React, { useState } from "react";
import { authApi } from "../../api/api";
import type { ChangePasswordRequest } from "../../auth/types";
import { Button } from "../../components/ui/Button";
import { showSuccess } from "../toast";
import { handleApiError } from "../../api/handleApiError";

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: ChangePasswordRequest = { currentPassword, newPassword };

    try {
      await authApi.changePassword(data);

      // 성공 UX만 여기서 처리
      showSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      handleApiError(error);
    }
  };

  const inputStyle =
    "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
        {/* 입력 영역 */}
        <div className="space-y-7">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputStyle}
            />
          </div>
        </div>

        {/* 버튼 */}
        <Button type="submit" variant="primary" size="sm">
          변경
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
