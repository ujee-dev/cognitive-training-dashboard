import React, { useState, useRef } from "react";
import { Button } from "../../components/ui/Button";

interface Props {
  profileImage?: string;
  onChangePreview: (file: File | null, preview: string | undefined) => void;
}

const ProfileImageUpload: React.FC<Props> = ({ profileImage, onChangePreview }) => {
  //const [preview, setPreview] = useState<string | undefined>(profileImage);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const displayImage = editingPreview ?? profileImage;

  const handleFileChange = (selectedFile: File | null) => {
    setMessage("");
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 기존의 preview가 Blob URL이라면 메모리 해제 (최적화)
    if (editingPreview && editingPreview.startsWith('blob:')) {
      URL.revokeObjectURL(editingPreview);
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setEditingPreview(objectUrl);
    onChangePreview(selectedFile, objectUrl);
  };

  const handleDelete = () => {
    if (editingPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editingPreview);
    }
    setEditingPreview(null);
    onChangePreview(null, undefined); // 상위에 전달
  };

  return (
    <div className="mb-6">
      {/* File Input: accept="image/*" 이미지 파일만 허용 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
        <div
          className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden ${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-200"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
        >
          {displayImage ? <img src={displayImage} alt="preview" className="w-full h-full object-cover"/> : <span className="text-gray-400 text-xl">+</span>}
        </div>

        {displayImage && (
          <div className="flex gap-2">
            <Button 
              variant="secondary" size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              변경
            </Button>
            <Button
              variant="danger" size="sm"
              onClick={handleDelete}
            >
              삭제
            </Button>
          </div>
        )}

        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
