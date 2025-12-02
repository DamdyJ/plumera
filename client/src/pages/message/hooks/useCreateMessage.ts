import { api } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type NewMessageVariables = { prompt: string; chatId: string };

export const useCreateMessage = () => {
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async ({ prompt, chatId }: NewMessageVariables) => {
      try {
        const response = await api.post(`/chats/${chatId}/messages`, {
          prompt,
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error);
          throw new Error(error.response?.data);
        }
      }
    },
    onError: (error) => {
      console.log("ERROR :!!!!", error);
      toast.error(`${error}`);
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["messages", { userId }, { chatId: variables.chatId }],
      });
    },
  });
};
