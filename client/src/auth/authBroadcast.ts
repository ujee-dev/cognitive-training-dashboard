import type { UserInfo } from "./types";

type AuthMessage = 
  | { type: "login" } 
  | { type: "logout" } 
  | { type: "profile-updated"; payload: UserInfo }; // 페이로드 추가

const channel = new BroadcastChannel("auth");

export const authBroadcast = {
  send(message: AuthMessage) {
    channel.postMessage(message);
  },

  subscribe(handler: (msg: AuthMessage) => void) {
    const listener = (e: MessageEvent<AuthMessage>) => handler(e.data);
    channel.addEventListener("message", listener);
    return () => channel.removeEventListener("message", listener);
  },
};
