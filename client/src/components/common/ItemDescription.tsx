// ItemDescription.tsx
import { ReactNode } from "react";

interface ItemDescriptionProps {
  description1: string;
  //dotColor1: string;
  isRightAligned1: boolean; // 오른쪽 정렬 여부

  description2: string;
  //dotColor2: string;
  isRightAligned2: boolean; // 오른쪽 정렬 여부
}

const ItemDescription: React.FC<ItemDescriptionProps> = ({
  description1,
  //dotColor1,
  isRightAligned1 = false, // 기본값은 false로 왼쪽 정렬
  
  description2,
  //dotColor2,
  isRightAligned2 = false, // 기본값은 false로 왼쪽 정렬
}) => {
  return (
    <div className='grid grid-cols-[2fr_1fr] py-1 tracking-wide text-white/80 text-xs'>
      <div className={`flex ${isRightAligned1 ? 'justify-end text-right' : ''}`}>
        {/* Tailwind에서는 클래스 이름 앞에 !를 추가하면 해당 스타일을 !important로 강제로 적용 */}
        <span className={`font-extrabold !text-[#2563eb] mr-2 !important`}>● </span>
        {description1}
      </div>
      <div className={`flex ${isRightAligned2 ? 'justify-end text-right' : ''}`}>
        <span className={`font-extrabold !text-[#93c5fd] mr-2 !important`}>● </span>
        {description2}
      </div>
    </div>
  );
};

export default ItemDescription;