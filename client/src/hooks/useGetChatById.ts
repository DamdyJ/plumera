import { getChatById } from "@/api/chat";
import { queryOptions } from "@tanstack/react-query";

export const fetchChatByIdQueryOptions = (chatId: string) =>
  queryOptions({
    queryKey: ["chats", { chatId }],
    queryFn: () => getChatById(chatId),
  });
