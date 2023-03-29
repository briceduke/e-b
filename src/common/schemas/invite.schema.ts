import { z } from "zod";

export const createInviteSchema = z.object({
  roomId: z.string().cuid(),
});
export type createInviteInput = ReturnType<typeof createInviteSchema.parse>;

export const acceptInviteSchema = z.object({
  token: z.string().uuid(),
});
export type acceptInviteInput = ReturnType<typeof acceptInviteSchema.parse>;
