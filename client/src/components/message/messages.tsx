import React, { useEffect, useLayoutEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  prompt: string;
  response: string;
};

export default function Messages({ data }: { data: Message[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);

  // 1) Immediately jump to bottom on initial mount (no animation, avoids flicker)
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    firstLoad.current = false;
    // empty deps -> run once on mount
  }, []);

  // 2) For subsequent data changes, smooth-scroll to bottom
  useEffect(() => {
    // if it's the very first render we already jumped in useLayoutEffect,
    // so skip smooth animation to avoid repeating or unwanted animation on load.
    if (firstLoad.current) return;

    // Optional: if you want to avoid forcing scroll while user is manually reading above,
    // you could check whether they're already near bottom before auto-scrolling.
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data]);

  // Debug
  console.debug("Messages component data:", data);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-6 text-center text-sm">
        No messages yet — send the first message.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[480px] space-y-4 overflow-y-auto rounded-md border p-3"
    >
      <h2 className="text-sm font-semibold">Messages</h2>

      {data.map((message) => (
        <div key={message.id} className="space-y-2 rounded-md border p-3">
          <div>
            <div className="text-muted-foreground text-xs">user</div>
            <div className="prose mt-1">{message.prompt}</div>
          </div>

          <div>
            <div className="text-muted-foreground text-xs">gemini</div>
            <div className="prose mt-1">
              <Markdown remarkPlugins={[remarkGfm]}>
                {message.response}
              </Markdown>
            </div>
          </div>
        </div>
      ))}

      {/* anchor to scroll into view on updates */}
      <div ref={bottomRef} />
    </div>
  );
}
