import { inviteRouter } from "@/server/api/routers/invite";
import { roomRouter } from "@/server/api/routers/room";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  invite: inviteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
