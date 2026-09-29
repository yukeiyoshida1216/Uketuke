export type IdleTimer = {
  start: () => void;
  stop: () => void;
  bump: () => void;
};

export function createIdleTimer(options: {
  timeoutMs: number;
  onFire: () => void;
}): IdleTimer {
  let enabled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    start() {
      enabled = true;
      this.bump();
    },
    stop() {
      enabled = false;
      clear();
    },
    bump() {
      if (!enabled) return;
      clear();
      timer = setTimeout(() => {
        timer = null;
        if (!enabled) return;
        options.onFire();
      }, options.timeoutMs);
    },
  };
}
