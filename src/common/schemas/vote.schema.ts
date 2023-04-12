import { z } from "zod";

export const voteSchema = z.object({
  hangoutId: z.string().cuid(),
  items: z.array(z.string().cuid()).length(5),
});
export type voteInput = ReturnType<typeof voteSchema.parse>;
