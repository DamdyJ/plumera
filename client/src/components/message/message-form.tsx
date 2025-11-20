import * as React from "react";

import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { SendHorizontal } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  prompt: z.string().max(1500, "Prompt must be at most 1500 characters."),
});

export function MessageForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });
  const onSubmit = async () => {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-xs overflow-x-auto rounded-md p-4">
          a
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  };

  return (
    <div className="w-full border-none shadow-none">
      <CardContent className="flex items-start px-0">
        <form
          id="chat-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-w-0 flex-1"
        >
          <FieldGroup>
            <Controller
              name="prompt"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-prompt-input" className="sr-only">
                      prompt
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="user-prompt-input"
                        placeholder="Ask any question..."
                        rows={6}
                        className="max-h-40 w-full resize-none overflow-y-auto"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end" className="border-t">
                        <Field orientation="horizontal">
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                          <Button
                            type="submit"
                            form="chat-form"
                            className="ml-auto"
                          >
                            <SendHorizontal />
                          </Button>
                        </Field>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </div>
  );
}
