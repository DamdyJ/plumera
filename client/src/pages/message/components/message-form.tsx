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
import { useCreateMessage } from "@/pages/message/hooks/useCreateMessage";
import { Spinner } from "../../../components/ui/spinner";

const formSchema = z.object({
  prompt: z.string().max(5000, "Prompt must be at most 5000 characters."),
});

export function MessageForm({ chatId }: { chatId: string }) {
  const { mutate: createMessage, isPending } = useCreateMessage();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMessage({ prompt: data.prompt, chatId });
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
                        className="scrollbar max-h-40 w-full resize-none overflow-y-auto"
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
                            disabled={isPending || form.formState.isSubmitting}
                          >
                            {isPending ? (
                              <>
                                <Spinner className="mr-2" />
                                Sending...
                              </>
                            ) : (
                              <SendHorizontal />
                            )}
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
