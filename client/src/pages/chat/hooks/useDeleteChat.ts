import { deleteChat } from "@/api/chat";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteChat = () => {
  const { userId } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteChat(id),
    onMutate: async (_deletedId, context) => {
      await context.client.cancelQueries({
        queryKey: ["chats", { userId }],
      });
      const previousChat = context.client.getQueryData(["chats", { userId }]);
      if (previousChat) {
        context.client.setQueryData(["chats", { userId }], {
          ...previousChat,
        });
      }

      return { previousChat };
    },
    onSuccess: () => {
      toast.success("Chat deleted.");
    },
    onError: (error, _deletedId, onMutateResult, context) => {
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
