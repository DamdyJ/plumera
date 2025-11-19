import { createChat } from "@/api/chat";
import type { ChatCreatePayload } from "@/types/chat-api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateNewChat = () =>
  useMutation({
    mutationFn: (payload: ChatCreatePayload) => createChat(payload),
    onSuccess: () => {
      toast.success("Chat created successfully!");
    },
    onError: () => {
      toast.success("Please try again!");
    },
  });
