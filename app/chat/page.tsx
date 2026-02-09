import ChatForm from "@/components/chat/chat-form";
import ChatView from "@/components/chat/chat-view";
import Heartfall from "@/components/chat/heartfall";
import Snowfall from "@/components/chat/snowfall";
import PushSubscriber from "@/components/push-subscriber";
import SecurityCheckPage from "@/components/security-check";
import { currentUser } from "@clerk/nextjs/server";

export default async function ChatPage() {
  const user = await currentUser();

  const isXmasSeason = new Date() <= new Date("2025-12-30T23:59:59");
  const ValentinesSeason = new Date() <= new Date("2026-02-14T23:59:59");

  return (
    <SecurityCheckPage>
      {/* ❄️ Xmas snow effect */}
      {isXmasSeason && <Snowfall />}
      {/* ❤️ Valentines heart effect */}
      {ValentinesSeason && <Heartfall />}
      <div className="flex items-center justify-center flex-col w-full h-dvh max-h-dvh md:h-screen overflow-y-hidden py-4 md:py-10 lg:py-12 relative">
        <ChatView />
        <ChatForm />

        {user && <PushSubscriber userId={user.id} />}
      </div>
    </SecurityCheckPage>
  );
}
