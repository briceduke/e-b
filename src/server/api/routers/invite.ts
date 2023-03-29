import { acceptInviteSchema, createInviteSchema } from "@/common/schemas";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const inviteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createInviteSchema)
    .mutation(async ({ input, ctx }) => {
      const { roomId } = input;
      const { user } = ctx.session;

      const room = await ctx.prisma.room.findUnique({
        where: {
          ownerId: user.id,
          id: roomId,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      const invite = await ctx.prisma.invite.create({
        data: {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          room: {
            connect: {
              id: room.id,
            },
          },
          createdBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return invite;
    }),

  accept: protectedProcedure
    .input(acceptInviteSchema)
    .mutation(async ({ input, ctx }) => {
      const { token } = input;
      const { user } = ctx.session;

      const invite = await ctx.prisma.invite.update({
        where: {
          id: token,
          expires: {
            gt: new Date(Date.now()),
          },
        },
        data: {
          expires: new Date(Date.now()),
          room: {
            update: {
              users: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        },
        select: {
          roomId: true,
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          activeRoomId: invite.roomId,
        },
      });

      return invite;
    }),
});
