import { useSyncExternalStore } from "react";

interface Atom<AtomType> {
  get: () => AtomType;
  set: (newValue: AtomType) => void;
  subscribe: (cb: (newValue: AtomType) => void) => () => void;
}

type AtomGetter<AtomType> = (get: <T>(a: Atom<T>) => T) => AtomType;

export function atom<AtomType>(
  initialValue: AtomType | AtomGetter<AtomType>
): Atom<AtomType> {
  let value =
    typeof initialValue === "function" ? (null as AtomType) : initialValue;

  const subscribers = new Set<(newValue: AtomType) => void>();

  function get<T>(atom: Atom<T>) {
    let currentValue = atom.get();

    atom.subscribe((newValue) => {
      if (newValue === currentValue) return;
      currentValue = newValue;
      computeValue();
      subscribers.forEach((cb) => cb(value));
    });

    return currentValue;
  }

  function computeValue() {
    const newValue =
      typeof initialValue === "function"
        ? (initialValue as AtomGetter<AtomType>)(get)
        : value;

    if (newValue && typeof (newValue as any).then === "function") {
      value = null as AtomType;

      (newValue as any as Promise<AtomType>).then((v) => {
        value = v;
        subscribers.forEach((cb) => cb(value));
      });
    } else {
      value = newValue;
    }
  }

  computeValue();

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
