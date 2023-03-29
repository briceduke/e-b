import type { User } from "@prisma/client";

export const filterUsersFields = (users: User[]) => {
  return users.map((user) => {
    const { id, name, image } = user;
    return { id, name, image };
  });
};

export const filterUserFields = (user: User) => {
  const { id, name, image } = user;
  return { id, name, image };
};
