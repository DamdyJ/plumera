import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import PdfUpload from "../pdf-upload";
import { useNavigate } from "@tanstack/react-router";
import { useCreateNewChat } from "@/hooks/useCreateNewChat";
import { useAuth } from "@clerk/clerk-react";
import { createChatForm } from "@/schema/create-chat-form";
import type { createChatType } from "@/types/create-chat";
import { Spinner } from "../ui/spinner";

export function ChatForm() {
  const { mutateAsync, isPending } = useCreateNewChat();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const form = useForm<createChatType>({
    resolver: zodResolver(createChatForm),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      pdf: null,
    },
  });

  const onSubmit = async (data: createChatType) => {
    const token = await getToken();
    const chat = await mutateAsync({
      title: data.jobTitle,
      description: data.jobDescription,
      pdf: data.pdf,
      token: token,
    });

    return await navigate({ to: `/chat/${chat.data.id}` });
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent>
        <form
          id="resume-analyzer-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup className="space-y-5">
            <Controller
              name="jobTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-resume-title">
                    Job Title *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-resume-title"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? "jobTitle-error" : undefined
                    }
                    placeholder="e.g., Senior Frontend Engineer"
                    autoComplete="off"
                    maxLength={64}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id="jobTitle-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="jobDescription"
              control={form.control}
              render={({ field, fieldState }) => {
                const max = 5000;
                const length = (field.value ?? "").length;
                const percentage = Math.round((length / max) * 100);
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-resume-description">
                      Job Description *
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-resume-description"
                        placeholder="Include required skills, responsibilities, experience level, and other details from the job posting."
                        rows={5}
                        maxLength={max}
                        className="max-h-40 min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.invalid
                            ? "description-error"
                            : "description-count"
                        }
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText
                          id="description-count"
                          className={`text-xs tabular-nums ${
                            percentage > 90
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {length}/{max}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    {fieldState.invalid && (
                      <FieldError
                        id="description-error"
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                );
              }}
            />

            <Controller
              name="pdf"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-resume-pdf">
                    Your Resume (PDF) *
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
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal" className="w-full gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="resume-analyzer-form"
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
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
      </CardFooter>
    </Card>
  );
}
