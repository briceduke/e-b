import { z } from "zod";

export const generateHangoutSchema = z.object({
  prompt: z.string().max(200, "200 or less characters").optional(),
  adventureLevel: z
    .number()
    .min(1, "1 or greater")
    .max(10, "10 or less")
    .optional()
    .default(8),
  roomId: z.string().cuid(),
});
export type generateHangoutInput = ReturnType<
  typeof generateHangoutSchema.parse
>;

export const deleteHangoutSchema = z.object({
  hangoutId: z.string().cuid(),
});
export type deleteHangoutInput = ReturnType<typeof deleteHangoutSchema.parse>;
