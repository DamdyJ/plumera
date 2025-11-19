import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

export default function ScoreResult({ score = 0 }: { score: number }) {
  return (
    <>
      <div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="group px-4 hover:cursor-pointer hover:no-underline">
              <div className="flex gap-2">
                <h4 className="text-base font-bold group-hover:underline">
                  Relevance
                </h4>
                <Badge
                  variant={"outline"}
                  className={cn(
                    "text-xs",
                    score >= 80 &&
                      "border-green-700 bg-green-100/80 text-green-700",
                    score >= 50 &&
                      score < 80 &&
                      "border-yellow-700 bg-yellow-100/80 text-yellow-700",
                    score < 50 && "border-red-700 bg-red-100/80 text-red-700",
                  )}
                >
                  {score}/100
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="mx-4">
              <Card className="shadow-none">
                <CardContent>
                  <ul className="text-muted-foreground space-y-4 text-sm">
                    <li>answer 1.</li>
                    <li>answer 2.</li>
                    <li>answer 3.</li>
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
