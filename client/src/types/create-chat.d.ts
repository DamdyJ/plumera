import z from "zod";
export type createChatType = z.infer<typeof createChatForm>;
