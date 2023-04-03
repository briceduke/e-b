import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { wrapApiHandlerWithSentry } from "@sentry/nextjs";
import { createNextApiHandler } from "@trpc/server/adapters/next";

export const config = {
  runtime: "edge",
};

// export API handler
const handler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});

export default wrapApiHandlerWithSentry(handler, "/api/[trpc]");
