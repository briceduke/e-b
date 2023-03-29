/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { toast } from "react-hot-toast";

import type { ZodError } from "zod";

export const formatErrors = (e: any) => {
  const zodError = e.data?.zodError as ZodError;

  if (zodError) {
    return zodError.errors.map((error) => ({
      message: error.message,
    }));
  } else {
    if (e.data.code === "UNAUTHORIZED") {
      return [{ message: "Unauthorized" }];
    }
  }
};

interface HandleErrorsProps {
  e: any;
  message?: string;
  fn?: () => any;
}

export const handleErrors = ({ e, message, fn }: HandleErrorsProps) => {
  const errors = formatErrors(e);

  if (errors) {
    errors.forEach((error) => toast.error(error.message));

    fn && void fn();
    return;
  }

  toast.error(message || "Something went wrong");

  fn && void fn();
  return;
};
