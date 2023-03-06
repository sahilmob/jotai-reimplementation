export function atom<AtomType>(initialValue: AtomType): {
  get: () => AtomType;
  set: (newValue: AtomType) => void;
  subscribe: (cb: (newValue: AtomType) => void) => () => void;
} {
  let value = initialValue;

  const subscribers = new Set<(newValue: AtomType) => void>();

  return {
    get: () => value,
    set: (newValue) => {
      value = newValue;
      subscribers.forEach((cb) => cb(newValue));
    },
    subscribe: (cb) => {
      subscribers.add(cb);

      return () => subscribers.delete(cb);
    },
  };
}

export function useAtom() {}
