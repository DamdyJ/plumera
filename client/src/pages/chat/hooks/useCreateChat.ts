import { api } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { CreateChatType, CreateChatResponseType } from "../types/chat";
import { toast } from "sonner";
import axios from "axios";

export const useCreateChat = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: CreateChatType) => {
      const formData = new FormData();
      formData.append("jobTitle", data.jobTitle);
      formData.append("jobDescription", data.jobDescription);
      formData.append("pdf", data.pdf);
      try {
        const response = await api.post<CreateChatResponseType>(
          "/chats",
          formData,
        );
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data.error.message);
        }
      }
    },

    onSuccess: (data, _variables, _onMutateResult, context) => {
      if (data) {
        toast.success("Chat created");
        context.client.invalidateQueries({
          queryKey: ["chats", { userId }],
        });
        navigate(`/chat/${data.id}`);
      }
    },

    onError: (error) => {
      toast.error(`${error}`);
    },
  });
};
