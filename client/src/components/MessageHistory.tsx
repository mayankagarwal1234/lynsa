import React, { useEffect, useState, useCallback, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

interface Message {
  _id: string;
  messageId: string;
  messageStatus: "sent" | "replied";
  senderName: string;
  receiverEmail: string;
  senderMessage: string;
  senderAttachment?: { fileName: string; fileUrl: string }[];
  replyName?: string;
  replyContent?: string;
  replyAttachment?: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageHistoryProps {
  isDark: boolean;
  latestMessageId: string | null;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  isDark,
  latestMessageId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyFileUrl, setReplyFileUrl] = useState<string | null>(null);
  const { authUser } = useContext(AuthContext);
  const [replyFileUrls, setReplyFileUrls] = useState<Record<string, string>>(
    {}
  );

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!authUser) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/hot-outreach/user/${authUser._id}`,
          {
            headers: {
              token: localStorage.getItem("token") || "",
            },
          }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [authUser]);

  // Helper to get reply attachment file
  const getReplyAttachment = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/hot-outreach/getreplyId",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ messageId }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get reply attachment ID");
      }

      const attachmentId = data.replyAttachmentId;
      if (!attachmentId) return;

      const fileResponse = await fetch(
        `http://localhost:5000/files/${attachmentId}`
      );
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch attachment file");
      }

      const fileBlob = await fileResponse.blob();
      const fileUrl = URL.createObjectURL(fileBlob);

      setReplyFileUrls((prev) => ({
        ...prev,
        [messageId]: fileUrl,
      }));
    } catch (err) {
      console.error("Error fetching reply attachment:", err);
    }
  }, []);

useEffect(() => {
  if (!latestMessageId) return;

  let pollingInterval: NodeJS.Timeout;
  let startTimeout: NodeJS.Timeout;

  startTimeout = setTimeout(() => {
    // Immediately check once
    getReplyAttachment(latestMessageId);

    // Start polling every 3 sec
    pollingInterval = setInterval(() => {
      getReplyAttachment(latestMessageId);
    }, 3000); 
  }); 

  return () => {
    clearTimeout(startTimeout);
    clearInterval(pollingInterval);
  };
}, [latestMessageId, getReplyAttachment]);



  if (loading) {
    return (
      <div
        className={`w-full max-w-3xl mx-auto mt-6 p-4 ${
          isDark ? "text-white" : "text-gray-700"
        }`}
      >
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className={`w-full max-w-3xl mx-auto mt-6 p-4 ${
          isDark ? "text-white" : "text-gray-700"
        }`}
      >
        <div className="text-center">
          No messages yet. Send your first hot outreach!
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-3xl mx-auto mt-6 space-y-4 ${
        isDark ? "text-white" : "text-gray-700"
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Message History
      </h3>

      {messages.map((message) => (
        <div
          key={message._id}
          className={`border rounded-lg p-4 ${
            isDark
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-800"
          } shadow-sm`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-semibold text-sm">
                From: {message.senderName}
              </div>
              <div className="text-sm opacity-75">
                To: {message.receiverEmail}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  message.messageStatus === "replied"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {message.messageStatus === "replied" ? "Replied" : "Sent"}
              </span>
              <span className="text-xs opacity-75">
                {new Date(message.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Sender message */}
          <div className="mb-3">
            <div className="font-medium text-sm mb-1">Your Message:</div>
            <div
              className={`p-3 rounded ${
                isDark ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"
              }`}
            >
              {message.senderMessage}
            </div>

            {Array.isArray(message.senderAttachment) &&
              message.senderAttachment.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.senderAttachment.map((file, index) => (
                    <a
                      key={index}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View attachment ${file.fileName}`}
                      className="text-blue-500 hover:text-blue-700 transition-colors text-sm flex items-center gap-1"
                    >
                      📎 <span>Attachment</span>
                    </a>
                  ))}
                </div>
              )}
          </div>

          {/* Reply */}
          {message.messageStatus === "replied" && message.replyContent && (
            <div className="border-t pt-3">
              <div className="font-medium text-sm mb-1">
                Reply from {message.replyName || "Unknown"}:
              </div>
              <div
                className={`p-3 rounded ${
                  isDark ? "bg-green-900 bg-opacity-30" : "bg-green-50"
                }`}
              >
                {message.replyContent}
              </div>
              {replyFileUrls[message.messageId] && (
                <div className="mt-2">
                  <a
                    href={replyFileUrls[message.messageId]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700 text-sm flex items-center gap-1"
                  >
                    📎 Reply Attachment
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t text-xs opacity-75">
            Payment ID: {message.paymentId}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageHistory;
