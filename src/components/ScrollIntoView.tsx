import { ReactNode, useRef, useEffect } from "react";

export function ScrollIntoView({ children }: { children: ReactNode }) {
  const myRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    myRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return <div ref={myRef}>{children}</div>;
}