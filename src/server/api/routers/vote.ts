import { voteSchema } from "@/common/schemas/vote.schema";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const voteRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(voteSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { user } = session;

      const hangout = await prisma.hangoutList.findUnique({
        where: {
          id: input.hangoutId,
          room: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
          votingEnded: false,
          voted: {
            none: {
              id: user.id,
            },
          },
        },
        select: {
          votesCount: true,
          votingEnded: true,
          room: {
            select: {
              users: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!hangout)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hangout not found",
        });

      const txs = [];

      for (let i = 0; i < input.items.length; i++) {
        txs.push(
          prisma.hangoutItem.update({
            where: {
              id: input.items[i],
            },
            data: {
              points: {
                increment: i + 1,
              },
            },
          })
        );
      }

      txs.push(
        prisma.hangoutList.update({
          where: {
            id: input.hangoutId,
          },
          data: {
            votesCount: {
              increment: 1,
            },
            votingEnded:
              hangout.votesCount + 1 === hangout.room.users.length
                ? true
                : false,
            voted: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      );

      await prisma.$transaction(txs);
    }),
});
