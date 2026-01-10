// auth/authBroadcast.ts - "알림만" 로직 X
type AuthMessage = "login" | "logout";

const channel = new BroadcastChannel("auth");

export const authBroadcast = {
  send(message: AuthMessage) {
    channel.postMessage(message);
  },

  subscribe(handler: (msg: AuthMessage) => void) {
    const listener = (e: MessageEvent<AuthMessage>) => {
      handler(e.data);
    };

    channel.addEventListener("message", listener);
    return () => channel.removeEventListener("message", listener);
  },
};
