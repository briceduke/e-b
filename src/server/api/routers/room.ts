import { createRoomSchema, getRoomSchema, updateRoomSchema } from '@/common/schemas';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRoomSchema)
    .mutation(async ({ input, ctx }) => {
      let { name } = input;
      const { user } = ctx.session;

      name = name ?? `${user.name ?? "User"}'s room`;

      const room = await ctx.prisma.room.create({
        data: {
          name,
          owner: {
            connect: {
              id: user.id,
            },
          },
          users: {
            connect: {
              id: user.id,
            },
          },
        },
        // include: {
        //   users: true,
        //   owner: true,
        // },
      });

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          activeRoomId: room.id,
        },
      });

      return {
        ...room,
        // users: filterUsersFields(room.users),
        // owner: filterUserFields(room.owner),
      };
    }),

  update: protectedProcedure
    .input(updateRoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...fields } = input;
      const { user } = ctx.session;

      const room = await ctx.prisma.room.update({
        where: {
          id,
          ownerId: user.id,
        },
        data: {
          ...fields,
        },
        // include: {
        //     users: true,
        //     owner: true,
        //   },
      });

      if (!room)
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      return {
        ...room,
        // users: filterUsersFields(room.users),
        // owner: filterUserFields(room.owner),
      };
    }),

  delete: protectedProcedure
    .input(getRoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { user } = ctx.session;

      const room = await ctx.prisma.room.delete({
        where: {
          id,
          ownerId: user.id,
        },
        select: {
          users: {
            select: {
              rooms: true,
            },
          },
        },
      });

      if (!room.users[0])
        throw new TRPCError({
          code: "CONFLICT",
          message: "We tried to get you",
        });

      if (!room)
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      const userRooms = room.users[0].rooms.filter(
        (e) => e.id !== user.activeRoomId
      );

      const activeRoomId = userRooms[0] ? userRooms[0].id ?? null : null;

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          activeRoomId,
        },
      });

      ctx.session.user.activeRoomId = activeRoomId ?? undefined;

      return {
        success: true,
        // users: filterUsersFields(room.users),
        // owner: filterUserFields(room.owner),
      };
    }),

  leave: protectedProcedure
    .input(getRoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { user } = ctx.session;

      const room = await ctx.prisma.room.update({
        where: {
          id,
          ownerId: {
            not: id,
          },
          users: {
            some: {
              id: user.id,
            },
          },
        },
        data: {
          users: {
            disconnect: {
              id: user.id,
            },
          },
        },
        select: {
          id: true,
          users: {
            where: {
              id: user.id,
            },
            include: {
              rooms: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!room.users[0])
        throw new TRPCError({
          code: "CONFLICT",
          message: "We tried to get you",
        });

      const userRooms = room.users[0].rooms.filter(
        (e) => e.id !== user.activeRoomId
      );

      const activeRoomId = userRooms[0] ? userRooms[0].id ?? null : null;

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          activeRoomId,
        },
      });

      ctx.session.user.activeRoomId = activeRoomId ?? undefined;

      return {
        success: true,
      };
    }),

  get: protectedProcedure.input(getRoomSchema).query(async ({ input, ctx }) => {
    const { id } = input;
    const { user } = ctx.session;

    const room = await ctx.prisma.room.findUnique({
      where: {
        id,
        users: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
      users: {
        select: {
          id: true,
          image: true,
          name: true
        }
      },
      owner: true,
      },
    });

    if (!room)
      throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

    await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        activeRoomId: room.id,
      },
    });

    return {
      ...room,
      // users: filterUsersFields(room.users),
      // owner: filterUserFields(room.owner),
    };
  }),

  getUserRooms: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session;

    const rooms = await ctx.prisma.room.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
      //   include: {
      //     users: true,
      //     owner: true,
      //   },
    });

    // return {
    // rooms: rooms.map((room) => ({
    //     ...room,
    // users: filterUsersFields(room.users),
    // owner: filterUserFields(room.owner),
    // })),
    //   ...rooms,
    // };

    return rooms;
  }),
});
