import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().max(20, "20 or less characters").optional(),
});
export type createRoomInput = ReturnType<typeof createRoomSchema.parse>;

export const getRoomSchema = z.object({
  id: z.string().cuid(),
});
export type getRoomInput = ReturnType<typeof getRoomSchema.parse>;

export const updateRoomSchema = getRoomSchema.merge(createRoomSchema);
export type updateRoomInput = ReturnType<typeof updateRoomSchema.parse>;
