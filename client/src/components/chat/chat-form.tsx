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

export function ChatForm() {
  const { mutateAsync } = useCreateNewChat();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const form = useForm<createChatType>({
    resolver: zodResolver(createChatForm),
    defaultValues: {
      title: "",
      description: "",
      pdf: null,
    },
  });

  const onSubmit = async (data: createChatType) => {
    const token = await getToken();
    const chat = await mutateAsync({
      title: data.title,
      description: data.description,
      pdf: data.pdf!,
      token: token,
    });
    return await navigate({ to: `/chat/${chat.data[0].id}` });
  };

  return (
    <Card className="w-full border-none shadow-none sm:max-w-2xl">
      <CardContent>
        <form id="resume-analyzer-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-resume-title">Job Title</FieldLabel>
                  <Input
                    {...field}
                    id="form-resume-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Senior Frontend Engineer Resume"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => {
                const max = 1500;
                const length = (field.value ?? "").length;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-resume-description">
                      Job Description
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-resume-description"
                        placeholder="Include required skills, responsibilities, experience level, and other details from the job posting."
                        rows={6}
                        className="max-h-40 min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {length}/{max} characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
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
                    Your Resume (PDF)
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
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="resume-analyzer-form">
            Analyze
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
