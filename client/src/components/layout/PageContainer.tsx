// 모든 페이지의 "가로폭 / 중앙정렬 / 여백"을 담당
// 페이지에서는 w-full, mx-auto 쓰지 않는다

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 space-y-6">
      {children}
    </section>
  );
}
