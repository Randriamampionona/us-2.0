"use client";

import { UserButton, useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return (
    <nav className="fixed top-2 right-2 z-50">
      <UserButton />
    </nav>
  );
}
