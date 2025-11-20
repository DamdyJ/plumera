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

export const Route = createFileRoute("/_authenticated/chat/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
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
                <PdfViewer file="/long.pdf" />
              </div>
            </Card>
            <div className="col-span-2 md:col-span-1">
              <TabsContent value="chat" className="h-full">
                <Card className="h-full shadow-none">
                  <CardContent className="flex max-h-[calc(100svh-10rem)] flex-1 flex-col">
                    <div className="flex-1 overflow-auto">
                      <ChatOption />
                      <ScoreResult score={10} />
                      <ScoreResult score={10} />
                      <ScoreResult score={10} />
                      <ScoreResult score={10} />
                      <ScoreResult score={10} />
                      <ScoreResult score={10} />
                    </div>
                    <div>
                      <MessageForm />
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
                    <Button>Analyize</Button>
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
