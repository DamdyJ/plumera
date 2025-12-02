import PdfUpload from "@/components/pdf-upload";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useCreateChat } from "../hooks/useCreateChat";
import type { CreateChatType } from "../types/chat";
import { createChatSchema } from "../validation";

export default function ChatForm() {
  const { mutate, isPending } = useCreateChat();

  const form = useForm<CreateChatType>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });
  const onSubmit = (data: CreateChatType) => {
    mutate(data);
  };

  return (
    <div className="bg-muted/50 h-full p-4 outline">
      <form
        id="chat-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col items-center justify-center gap-4"
      >
        <FieldGroup>
          <Controller
            name="jobTitle"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="chat-form-title">Job Title</FieldLabel>
                <Input
                  {...field}
                  id="chat-form-title"
                  value={field.value}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g., Senior Frontend Engineer"
                  autoComplete="off"
                  className="bg-background"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="jobDescription"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="chat-form-description">
                  Job Description
                </FieldLabel>
                <InputGroup className="bg-background">
                  <InputGroupTextarea
                    {...field}
                    id="chat-form-description"
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                    placeholder="Include required skills, responsibilities, experience level, and other details from the job posting."
                    maxLength={5000}
                    rows={6}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="pdf"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="chat-form-pdf">
                  resume/cv (.pdf)
                </FieldLabel>
                <PdfUpload
                  value={field.value}
                  onChange={(file: File | null) => {
                    field.onChange(file);
                    if (file) {
                      form.clearErrors("pdf");
                    }
                  }}
                  onError={(error?: Error | null) => {
                    field.onChange(null);
                    form.setError("pdf", {
                      type: "manual",
                      message: error?.message ?? "Invalid file",
                    });
                  }}
                />

                {fieldState.invalid && (
                  <FieldError id="pdf-error" errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="chat-form">
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </Field>
      </form>
    </div>
  );
}
