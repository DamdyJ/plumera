import React from "react";

type Block =
  | { type: "text"; content: string }
  | { type: "heading"; level: number; content: string }
  | { type: "code"; content: string; lang?: string }
  | { type: "list"; items: string[] };

export default function BlocksRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((b, i) => {
        if (b.type === "text") return <p key={i}>{b.content}</p>;
        if (b.type === "heading")
          return React.createElement(`h${b.level}`, { key: i }, b.content);
        if (b.type === "code")
          return (
            <pre key={i}>
              <code>{b.content}</code>
            </pre>
          );
        if (b.type === "list")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        return null;
      })}
    </div>
  );
}
