import React, { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "../../components/ui/Button";

interface Props {
  profileImage?: string;
  onChangePreview: (file: File | null, preview: string | undefined) => void;
}

const MAX_FILE_MB = 0.05; // 50KB: 원본 업로드 최대 허용 (모바일 사진 보호)
const COMPRESS_MAX_MB = 0.3; // 최종 목표 용량
const MAX_WIDTH = 80; // 프로필 최대 해상도

const ProfileImageUpload: React.FC<Props> = ({ profileImage, onChangePreview }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  // 표시 이미지 (기존 이미지 or 편집 이미지)
  const displayImage = editingPreview ?? profileImage;

  /**
   * 이미지 압축
   * - WebP 변환
   * - 해상도 제한
   * - 용량 제한
   */
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: COMPRESS_MAX_MB,
      maxWidthOrHeight: MAX_WIDTH,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8
    };

    const compressed = await imageCompression(file, options);

    return compressed;
  };

  const isImageFile = (file: File) => {
    // MIME type 검사
    if (file.type && file.type.startsWith("image/")) return true;

    // 확장자 검사 (type이 비어있는 브라우저 대응)
    const ext = file.name.split(".").pop()?.toLowerCase();

    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext || "");
  };

  /**
   * 파일 처리
   * - 타입 체크
   * - 용량 체크
   * - 압축
   * - preview 생성
   */
  const handleFileChange = async (selectedFile: File | null) => {
    setMessage("");

    if (!selectedFile) return;

    if (selectedFile.size === 0) {
      setMessage("파일을 읽을 수 없습니다.");
      return;
    }

    // 이미지 타입 검사
    if (!isImageFile(selectedFile)) {
      setMessage("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 원본 파일 용량 제한
    if (selectedFile.size > MAX_FILE_MB * 1024 * 1024) {
      setMessage(`이미지는 ${MAX_FILE_MB}MB 이하만 가능합니다.`);
      return;
    }

    try {
      // 이미지 압축
      const compressedFile = await compressImage(selectedFile);

      // 기존 blob URL 메모리 해제
      if (editingPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editingPreview);
      }

      // preview 생성
      const objectUrl = URL.createObjectURL(compressedFile);

      setEditingPreview(objectUrl);

      // 상위 컴포넌트 전달
      onChangePreview(compressedFile, objectUrl);

      setMessage("이미지가 최적화되어 업로드됩니다.");

    } catch (error) {
      console.error(error);
      setMessage("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  /**
   * 이미지 삭제
   */
  const handleDelete = () => {
    if (editingPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editingPreview);
    }

    setEditingPreview(null);
    onChangePreview(null, undefined);
  };

  /**
   * drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * drag leave
   */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /**
   * drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const files = e.dataTransfer.files;

    if (!files || files.length === 0) return;

    // 첫 번째 파일만 사용
    handleFileChange(files[0]);
  };

  useEffect(() => {
    return () => {
      if (editingPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editingPreview);
      }
    };
  }, [editingPreview]);

  return (
    <div className="mb-6">

      {/* 실제 파일 input (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          //console.log("input change", file);
          handleFileChange(file || null);
        }}
      />

      <div className="grid grid-cols-[auto_1fr] gap-6 items-center">

        {/* 프로필 이미지 영역 */}
        <div
          className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden
          ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-200"}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="profile preview"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xl">+</span>
          )}
        </div>

        {/* 버튼 영역 */}
        {displayImage && (
          <div className="flex gap-2">

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              변경
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              삭제
            </Button>

          </div>
        )}

        {/* 메시지 */}
        {message && (
          <p className="text-sm text-green-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
};

export default ProfileImageUpload;
