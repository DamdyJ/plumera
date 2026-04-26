import { Router } from "express";
import {
  createResume,
  createTargetJob,
  deleteResume,
  getResume,
  listResumes,
  listTargetJobs,
  updateResume,
} from "./resume.controller";

export const ResumeRouter = Router();

ResumeRouter.get("/", listResumes);
ResumeRouter.post("/", createResume);
ResumeRouter.get("/:resumeId", getResume);
ResumeRouter.patch("/:resumeId", updateResume);
ResumeRouter.delete("/:resumeId", deleteResume);
ResumeRouter.get("/:resumeId/jobs", listTargetJobs);
ResumeRouter.post("/:resumeId/jobs", createTargetJob);
