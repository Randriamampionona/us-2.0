type TProps = {
  username: string;
};

export default function TypingBubble({ username }: TProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-black py-2 rounded-2xl max-w-max shadow">
        <div className="flex space-x-1">
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
        </div>
      </div>
      <span className="text-sm text-gray-500 mb-1">
        {username} is typing...
      </span>
    </div>
  );
}
