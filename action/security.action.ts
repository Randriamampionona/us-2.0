"use server";

import { currentUser } from "@clerk/nextjs/server";

const ALLOWED_EMAIL_ADDRESS = process.env.ALLOWED_EMAIL_ADDRESS!;

export async function security() {
  const user = await currentUser();
  const emails = ALLOWED_EMAIL_ADDRESS.split("|");

  const userEmail = user?.primaryEmailAddress;

  if (!userEmail) return false;

  const isAllowed = !!emails.find((email) => email == userEmail.emailAddress);

  return isAllowed;
}
