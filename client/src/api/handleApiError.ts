import { AxiosError } from "axios";
import {
  showValidationError,
  showForbidden,
  showServerError,
  showConflict,
  showSessionExpired,
} from "../ui/toast";
import type { ApiErrorResponse } from "./types";

export function handleApiError(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (!axiosError.response) {
    showServerError(); // 네트워크 연결 자체가 끊긴 경우
    return;
  }

  const { status, data } = axiosError.response;

  switch (status) {
    case 400:
      // NestJS의 ValidationPipe는 message를 배열이나 문자열로 줍니다.
      showValidationError(data?.message);
      break;

    case 401:
      // data.code가 아니라 status만으로도 일단 Toast를 띄워야 함
      showSessionExpired();
      break;

    case 403:
      showForbidden();
      break;

    case 409:
      showConflict(
        typeof data?.message === "string" ? data.message : undefined
      );
      break;

    case 500:
    default:
      showServerError();
  }
}
