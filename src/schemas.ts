import { z } from "zod";

export const ProjectCreateInput = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty"),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateInput>;

export const Media = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  hashed_id: z.string().optional(),
});
export type Media = z.infer<typeof Media>;
