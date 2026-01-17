import NativeBar from "@/components/ad/native-bar";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center flex-col w-full h-screen">
      <SignIn />
      <NativeBar />
    </div>
  );
}
