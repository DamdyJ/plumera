import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

import { useState } from "react";
import { Document, Page } from "react-pdf";
import { Skeleton } from "@/components/ui/skeleton";

export function RenderPDF({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="p-4 bg-muted">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Skeleton className="aspect-[1/1.41] w-full" />}
        className="flex flex-col gap-4"
      >
        {Array.from({ length: numPages ?? 0 }, (_v, i) => i + 1).map((page) => (
          <Page
            key={page}
            pageNumber={page}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
