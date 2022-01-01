import { CSSProperties } from "vue";

export const toVueStyle = (css: CSSProperties) =>
  Object.fromEntries(
    Object.entries(css).map(
      ([k, v]) => [k, typeof v === "number" ? `${v}px` : v] as const
    )
  );
