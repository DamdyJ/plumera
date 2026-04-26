import type { RequestHandler } from "express";
import { sendNotImplemented } from "../../utils/not-implemented-response.util";

const resumeMessage = "Resume API foundation is ready; persistence is implemented in Phase 2.";

export const listResumes: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const createResume: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const getResume: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const updateResume: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const deleteResume: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const listTargetJobs: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};

export const createTargetJob: RequestHandler = (_req, res) => {
  sendNotImplemented(res, resumeMessage);
};
