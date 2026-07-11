import { ReactNode } from "react";

export function CopyHighlight({ children }: { children: ReactNode }) {
  return <strong className="copy-emphasis">{children}</strong>;
}
