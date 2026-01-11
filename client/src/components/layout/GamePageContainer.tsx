// 모든 페이지의 "가로폭 / 중앙정렬 / 여백"을 담당
// 페이지에서는 w-full, mx-auto 쓰지 않는다

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function GamePageContainer({ children }: Props) {
  return (
    <section className="space-y-5">
      {children}
    </section>
  );
}
