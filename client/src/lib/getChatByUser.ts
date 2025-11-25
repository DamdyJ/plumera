import { getChatByUserId } from "@/api/chat";
import { queryOptions } from "@tanstack/react-query";

export const fetchChatByUserId = () =>
  queryOptions({
    queryKey: ["chats"],
    queryFn: () => getChatByUserId(),
  });
