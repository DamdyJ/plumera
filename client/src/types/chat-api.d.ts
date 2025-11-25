export type ChatCreatePayload = {
  title: string;
  description: string;
  pdf: File;
  token: string | null;
};

export type ApiErrorResponse = {
  message?: string;
  details?: { path: string; message: string }[];
};
