import { ChatForm } from "@/components/chat-form";
import { createFileRoute } from "@tanstack/react-router";
import { pdfjs, Document, Page } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const Route = createFileRoute("/chat/$id")({
  loader: ({ params }) => fetch(params.id),
  component: RouteComponent,
});

function RouteComponent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = Route.useParams();

  return (
    <>
      <section className="flex">
        <div className="hidden h-[calc(100svh-65px)] flex-1 overflow-y-scroll py-8 md:block">
          <Document file="/test.pdf" className="mx-auto w-fit">
            <Page
              pageNumber={1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        <div className="flex h-[calc(100vh-65px)] flex-1 flex-col">
          <div className="flex-1 overflow-auto p-8">
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam,
              quod laborum molestias asperiores tenetur aliquam qui ipsam cum,
              beatae voluptas quasi quaerat commodi neque possimus
              exercitationem reiciendis harum sint dicta?
            </p>
          </div>

          <div className="bg-background">
            <ChatForm />
          </div>
        </div>
      </section>
    </>
  );
}
