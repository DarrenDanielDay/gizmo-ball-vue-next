import { Ref, ref } from "vue";

export const useState = <T>(initValue: T) => {
  // @ts-expect-error
  const inner: Ref<T> = ref(initValue);
  return [
    inner,
    (action: T | ((pre: T) => T)) =>
      (inner.value =
        // @ts-expect-error Actually T should not be function
        typeof action === "function" ? action(inner.value) : action),
  ] as const;
};

export const useReducer = <T>(reducer: (pre: T) => T, initialValue: T) => {
  // @ts-expect-error
  const inner: Ref<T> = ref(initialValue);
  return [inner, () => (inner.value = reducer(inner.value))] as const;
};
