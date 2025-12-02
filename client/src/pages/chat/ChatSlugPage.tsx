import { MessageForm } from "@/pages/message/components/message-form";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSuspenseQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { useParams } from "react-router";
import { api } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import type { GetChatResponseType } from "./types/chat";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { CreateMessageResponseType } from "./types/message";
import { RenderPDF } from "./components/ui/render-pdf";

export default function ChatSlugPage() {
  const { id: chatId } = useParams();
  const { userId } = useAuth();
  const { data: chat } = useSuspenseQuery({
    queryKey: ["chats", { userId }, { chatId }],
    queryFn: async () => {
      const response = await api.get<GetChatResponseType>(`/chats/${chatId}`);
      return response.data;
    },
  });
  const { data: messages } = useSuspenseQuery({
    queryKey: ["messages", { userId }, { chatId }],
    queryFn: async () => {
      const response = await api.get<CreateMessageResponseType[]>(
        `/chats/${chatId}/messages`,
      );
      return response.data;
    },
  });
  const { containerRef, bottomRef } = useAutoScroll(messages);

  return (
    <div className="m-4 h-full overflow-auto">
      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2">
        <div className="scrollbar hidden overflow-y-auto border md:block">
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong!</div>}>
              <RenderPDF
                file={import.meta.env.VITE_STORAGE_URL + chat.fileUrl}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
        <div className="scrollbar grid h-full grid-rows-[1fr_auto] overflow-auto border">
          <div
            ref={containerRef}
            className="scrollbar min-h-0 overflow-y-auto p-4"
          >
            {messages.map((message) => (
              <div key={message.id} className="mb-8 flex flex-col gap-4">
                <div className="flex justify-end">
                  <div>
                    <span className="text-sm">
                      <strong>You</strong>
                    </span>
                    <p className="bg-primary text-primary-foreground max-w-xs rounded-t-lg rounded-bl-lg p-2">
                      {message.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-start gap-1 [&_pre]:whitespace-pre-wrap">
                  <span className="text-sm">
                    <strong>Plumera assistance</strong>
                  </span>
                  <Markdown>{message.response}</Markdown>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-4">
            <MessageForm chatId={chatId!} />
          </div>
        </div>
      </div>
    </div>
  );
}
