"use server";

import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { db } from "@/firebase";
import { TUser } from "@/typing";
import { auth } from "@clerk/nextjs/server";
import { collection, getDocs } from "firebase/firestore";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function getOtherUser() {
  const { userId } = await auth();

  try {
    const usersSnapshot = await getDocs(collection(db, USERCOLECTION));
    const users: TUser[] = usersSnapshot.docs
      .filter((doc) => doc.id !== userId)
      .map((doc) => {
        const user = doc.data() as Omit<TUser, "id">;
        return {
          id: doc.id,
          ...user,
        } satisfies TUser;
      });

    if (users.length === 0) throw new Error("User not found");

    const otherUser = users[0];

    return otherUser;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}
