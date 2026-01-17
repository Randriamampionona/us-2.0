import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center flex-col w-full h-screen">
      <SignIn />
    </div>
  );
}
