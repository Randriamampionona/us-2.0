import ChatForm from "@/components/chat/chat-form";
import ChatView from "@/components/chat/chat-view";

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center flex-col w-full h-dvh max-h-dvh md:h-screen md:max-h-screen overflow-y-hidden py-4 md:py-10 lg:py-12">
      <ChatView />
      <ChatForm />
    </div>
  );
}
