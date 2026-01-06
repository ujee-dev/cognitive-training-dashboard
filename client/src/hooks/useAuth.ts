import { useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // 로컬 useState를 모두 삭제하고, context 자체를 반환합니다.
  // 이렇게 해야 AuthProvider의 상태가 변할 때 이 훅을 쓰는 컴포넌트도 같이 변합니다.
  return context; 
};
