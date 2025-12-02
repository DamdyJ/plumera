import { api } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useRenameChat = () => {
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      chatTitle,
    }: {
      id: string;
      chatTitle: string;
    }) => {
      try {
        const response = await api.put(`/chats/${id}`, { chatTitle });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data.error.message);
        }
      }
    },
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({
        queryKey: ["chats", { userId }],
      });
      const previousChat = context.client.getQueryData(["chats", { userId }]);
      if (previousChat) {
        context.client.setQueryData(["chats", { userId }], {
          ...previousChat,
          ...variables,
        });
      }

      return { previousChat };
    },
    onSuccess: () => {
      toast.success("Chat title changed.");
    },
    onError: (error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousChat) {
        toast.error(`${error}`);
        context.client.setQueryData(
          ["chats", { userId }],
          onMutateResult.previousChat,
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["chats", { userId }] });
    },
  });
};
