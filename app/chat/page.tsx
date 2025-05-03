import ChatForm from "@/components/chat/chat-form";
import ChatView from "@/components/chat/chat-view";
import PushSubscriber from "@/components/push-subscriber";
import SecurityCheckPage from "@/components/security-check";
import { currentUser } from "@clerk/nextjs/server";

export default async function ChatPage() {
  const user = await currentUser();

  return (
    <SecurityCheckPage>
      <div className="flex items-center justify-center flex-col w-full h-dvh max-h-dvh md:h-screen md:max-h-screen overflow-y-hidden py-4 md:py-10 lg:py-12">
        <ChatView />
        <ChatForm />
        {user && (
          <>
            <PushSubscriber userId={user.id} />
          </>
        )}
      </div>
    </SecurityCheckPage>
  );
}
