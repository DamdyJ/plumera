import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ChatOption from "@/components/chat/chat-option";
import ScoreResult from "@/components/chat/score-result";
import PdfViewer from "@/components/pdf-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { TotalScoreChart } from "@/components/chat/total-score-chart";
import { MessageForm } from "@/components/message/message-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchChatByIdQueryOptions } from "@/hooks/useGetChatById";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import Messages from "@/components/message/messages";
import { fetchMessageByChatId } from "@/lib/fetchMessageByChatId";
import SimpleChat from "@/components/message/test";

export const Route = createFileRoute("/_authenticated/chat/$id/")({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(fetchChatByIdQueryOptions(params.id));
    await queryClient.ensureQueryData(fetchMessageByChatId(params.id));
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(fetchChatByIdQueryOptions(id));
  const { data: messages } = useSuspenseQuery(fetchMessageByChatId(id));
  console.log("MESSAGES data", messages);
  return (
    <Card className="bg-sidebar mx-auto max-w-screen-2xl border-0 p-0 shadow-none">
      <Tabs defaultValue="chat" className="gap-0">
        <header className="bg-background outline-border mx-auto flex h-12 w-full max-w-screen-2xl items-center justify-between rounded-lg outline">
          <SidebarTrigger className="shadow-none" />
          <TabsList>
            <TabsTrigger value="chat" className="px-4 text-sm">
              chat
            </TabsTrigger>
            <TabsTrigger value="score" className="px-4 text-sm">
              score
            </TabsTrigger>
          </TabsList>
          <div />
        </header>

        <CardContent className="px-0 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-1 hidden h-full grid-cols-1 overflow-hidden border-r p-0 shadow-none md:block">
              <div className="max-h-[calc(100svh-7rem)] overflow-y-auto">
                <Suspense fallback={<div>PLEASE WAIT...</div>}>
                  <PdfViewer
                    file={import.meta.env.VITE_STORAGE_URL + data.data.fileUrl}
                  />
                </Suspense>
              </div>
            </Card>
            <div className="col-span-2 md:col-span-1">
              <TabsContent value="chat" className="h-full">
                <Card className="h-full shadow-none">
                  <CardContent className="flex max-h-[calc(100svh-10rem)] flex-1 flex-col">
                    <div className="flex-1 overflow-auto">
                      {/* <SimpleChat/> */}
                      <Suspense fallback={<div>wait message</div>}>
                        <Messages data={messages} />
                      </Suspense>
                    </div>
                    <div>
                      <MessageForm chatId={id} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="score" className="h-full">
                <Card className="flex max-h-[calc(100svh-7rem)] flex-1 flex-col overflow-y-auto p-6 shadow-none">
                  <div className="flex-1 overflow-auto">
                    <h3 className="text-xl font-bold">Resume Review</h3>
                    <Card>
                      <TotalScoreChart />
                    </Card>
                    <ScoreResult score={40} />
                    <ScoreResult score={70} />
                    <ScoreResult score={80} />
                    <ScoreResult score={100} />
                    <ScoreResult score={66} />
                  </div>
                  <div className="self-end pt-4">
                    <Button>Analyze</Button>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}
