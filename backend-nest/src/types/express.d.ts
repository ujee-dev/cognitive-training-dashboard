import 'express';

declare global {
  namespace Express {
    // 1. Request 확장 (기존 내용)
    interface Request {
      cookies: Record<string, string | undefined>;
    }

    // 2. Response 확장 (추가)
    // 이 정의가 있어야 res.cookie() 호출 시 'Unsafe call' 에러가 사라집니다.
    interface Response {
      cookie(
        name: string,
        value: string,
        options?: import('express').CookieOptions,
      ): this;
      clearCookie(
        name: string,
        options?: import('express').CookieOptions,
      ): this;
    }
  }
}

export {};
