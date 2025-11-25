import { createMessage } from "@/api/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type NewMessageVariables = { prompt: string; chatId: string };

export const useCreateNewMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prompt, chatId }: NewMessageVariables) =>
      createMessage(prompt, chatId),
    onSettled(variables) {
      queryClient.invalidateQueries({
        queryKey: ["messages", { chatId: variables.chatId }],
      });
    },
  });
};
