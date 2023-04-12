import { Configuration, OpenAIApi } from "openai";

import { getRoomSchema } from "@/common/schemas";
import {
  deleteHangoutSchema,
  generateHangoutSchema,
} from "@/common/schemas/hangout.schema";
import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

import type { Prisma } from "@prisma/client";

const openAiConfig = new Configuration({
  organization: env.OPENAI_ORGANIZATION,
  apiKey: env.OPENAI_API_KEY,
});

export const hangoutRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(generateHangoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { user } = session;

      const room = await prisma.room.findUnique({
        where: {
          id: input.roomId,
          users: {
            some: {
              id: user.id,
            },
          },
          OR: [
            {
              users: {
                some: {
                  id: user.id,
                  premium: true,
                },
              },
            },
            {
              tier: {
                gte: 1,
              },
            },
          ],
        },
        include: {
          users: {
            select: {
              id: true,
            },
          },
          hangoutLists: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!room)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found or isn't at the right tier",
        });

      if (room.hangoutLists.length > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can have up to 1 hangout lists",
        });

      const openai = new OpenAIApi(openAiConfig);

      const hangoutPrompt = `
        Give me a list of 5 hangout ideas for ${
          room.users.length
        } people. Here's more specific information on what I want:
        ${input.prompt ?? "No specific information, surprise me!"}

        On the adventure-o-meter, I want the ideas to be this adventurous and thrilling (on a scale from 1-10): ${
          input.adventureLevel
        }

        No NSFW ideas. Generate the list in a concise manner, 20 words max. Separate each idea with a new line:
        `;

      const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        messages: [
          {
            content: hangoutPrompt,
            role: "user",
          },
        ],
      });

      if (!result.data.choices[0])
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Our AI is hallucinating, try again",
        });

      const stringResult = result.data.choices[0].message?.content;

      if (!stringResult)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Our AI is hallucinating, try again",
        });

      const ideas: string[] = stringResult.trim().split("\n");

      const numberTrimmedIdeas = ideas.map((idea) => idea.substring(2));

      if (numberTrimmedIdeas.length !== 5)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Our AI is hallucinating, try again",
        });

      const hangout = await prisma.hangoutList.create({
        data: {
          createdById: user.id,
          roomId: input.roomId,
        },
      });

      const itemsList: Prisma.Enumerable<Prisma.HangoutItemCreateManyInput> =
        [];

      for (const item of numberTrimmedIdeas) {
        itemsList.push({
          content: item,
          hangoutListId: hangout.id,
        });
      }

      await prisma.hangoutItem.createMany({
        data: itemsList,
      });

      return hangout;
    }),
  getRoomHangoutLists: protectedProcedure
    .input(getRoomSchema)
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { user } = session;

      const hangouts = await prisma.hangoutList.findMany({
        where: {
          roomId: input.id,
          room: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
        take: 10,
        select: {
          voted: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          id: true,
          items: {
            select: {
              content: true,
              points: true,
              id: true,
            },
          },
          votesCount: true,
          votingEnded: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return hangouts;
    }),
  delete: protectedProcedure
    .input(deleteHangoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { user } = session;

      const list = await prisma.hangoutList.delete({
        where: {
          id: input.hangoutId,
          createdById: user.id,
        },
      });

      if (!list)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });

      return true;
    }),
  end: protectedProcedure
    .input(deleteHangoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { user } = session;

      const list = await prisma.hangoutList.update({
        where: {
          id: input.hangoutId,
          createdById: user.id,
        },
        data: {
          votingEnded: true,
        },
      });

      if (!list)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });

      return true;
    }),
});
