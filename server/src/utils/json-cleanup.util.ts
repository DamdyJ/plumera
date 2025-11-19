import { Scores } from "src/types/score";

export default function jsonCleanup(markdown: string) {
  const codeFenceMatch = markdown.match(/```json\s*([\s\S]*?)```/i);
  const raw = codeFenceMatch ? codeFenceMatch[1].trim() : markdown.trim();

  const json = JSON.parse(raw) as Scores;
  return json;
}
