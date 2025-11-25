import { getMessageByChatId } from "@/api/message";
import { queryOptions } from "@tanstack/react-query";

export const fetchMessageByChatId = (chatId: string) =>
  queryOptions({
    queryKey: ["messages", {chatId} ],
    queryFn: () => getMessageByChatId(chatId),
  });
