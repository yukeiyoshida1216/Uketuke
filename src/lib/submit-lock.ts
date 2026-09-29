export function createSubmitLock() {
  let locked = false;
  return {
    tryLock(): boolean {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
    get locked() {
      return locked;
    },
  };
}
