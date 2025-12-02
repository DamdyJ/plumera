import { useRef, useLayoutEffect, useEffect } from "react";

export function useAutoScroll<T extends { id: string }>(dependencies: T[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);

  // jump to bottom immediately on mount
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    firstLoad.current = false;
  }, []);

  // extract last message id for dependency
  const lastMessageId = dependencies.length
    ? dependencies[dependencies.length - 1].id
    : null;

  // smooth scroll on new messages
  useEffect(() => {
    if (firstLoad.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastMessageId]);

  return { containerRef, bottomRef };
}
