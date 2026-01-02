declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg";
declare module "*.svg";

interface ImportMetaEnv {
  // 사용하려는 환경 변수들을 여기에 정의합니다.
  readonly VITE_APP_API_URL: string;
  // 추가적인 변수가 있다면 여기에 계속 정의...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
