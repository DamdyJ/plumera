import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ChatOption from "@/components/chat/chat-option";
import ScoreResult from "@/components/chat/score-result";
import PdfViewer from "@/components/pdf-viewer";
import { Card } from "@/components/ui/card";
import { TotalScoreChart } from "@/components/chat/total-score-chart";

export const Route = createFileRoute("/_authenticated/chat/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Tabs defaultValue="chat" className="gap-0">
        <header className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between border-b p-6">
          <Button variant={"link"}>Back</Button>
          <TabsList>
            <TabsTrigger value="chat" className="px-4 text-base">
              chat
            </TabsTrigger>
            <TabsTrigger value="score" className="px-4 text-base">
              score
            </TabsTrigger>
          </TabsList>
          <Button>analyzie</Button>
        </header>
        <section className="ourline-red-500 mx-auto max-h-[calc(100svh-65px)] max-w-screen-2xl">
          <div className="grid grid-cols-2">
            <div className="scrollbar-thin scrollbar-thumb-border scrollbar-thumb-rounded-full bg-sidebar col-span-1 hidden h-full max-h-[calc(100svh-65px)] grid-cols-1 overflow-y-auto border-r p-6 md:block">
              <PdfViewer file="/long.pdf" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <TabsContent value="chat">
                <div className="flex h-[calc(100vh-72px)] flex-1 flex-col">
                  <div className="flex-1 overflow-auto p-8">
                    <ChatOption />
                    <ScoreResult score={10} />
                  </div>
                  <div className="bg-background p-8">
                    {/* <ChatForm /> */}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="score">
                <div className="flex h-[calc(100vh-72px)] flex-1 flex-col overflow-y-auto p-6">
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
              </TabsContent>
            </div>
          </div>
        </section>
      </Tabs>
    </>
  );
}
