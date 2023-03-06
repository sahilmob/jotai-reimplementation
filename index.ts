import { useSyncExternalStore } from "react";

interface Atom<AtomType> {
  get: () => AtomType;
  set: (newValue: AtomType) => void;
  subscribe: (cb: (newValue: AtomType) => void) => () => void;
}

export function atom<AtomType>(initialValue: AtomType): Atom<AtomType> {
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

export function useAtom<AtomType>(atom: Atom<AtomType>) {
  return [useSyncExternalStore(atom.subscribe, atom.get), atom.set];
}

export function useAtomValue<AtomType>(atom: Atom<AtomType>) {
  return useSyncExternalStore(atom.subscribe, atom.get);
}
