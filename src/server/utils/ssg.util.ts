import superjson from "superjson";

import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";

export const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, session: null },
    transformer: superjson, // optional - adds superjson serialization
  });
