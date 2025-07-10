import React from "react";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="max-w-3xl mx-auto p-5">
      <div className="mt-5">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 italic">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-600">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{message.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessageList;
