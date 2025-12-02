import { fetchChats } from "@/api/chat";
import { useAuth } from "@clerk/clerk-react";
import { queryOptions } from "@tanstack/react-query";

export const useChats = () => {
  const { userId } = useAuth();
  return queryOptions({
    queryKey: ["chats", { userId }],
    queryFn: fetchChats,
    select: (data) =>
      data.map((item) => ({
        id: item.id,
        name: item.chatTitle,
        url: item.id,
      })),
  });
};
