type Listener = () => void;

const listeners = new Set<Listener>();

export const authEventBus = {
  subscribe(listener: Listener) {
    listeners.add(listener);

    // cleanup은 void 반환
    return () => {
      listeners.delete(listener);
    };
  },

  emit(event: "refresh-failed") {
    if (event === "refresh-failed") {
      listeners.forEach((listener) => listener());
    }
  },
};
