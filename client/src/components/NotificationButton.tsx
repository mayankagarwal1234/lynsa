
import React, { useState, useEffect } from "react";

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

interface Notification {
  id: number;
  from: string;
  content: string;
  attachments: Attachment[];
}

interface Props {
  messageData: {
    replies?: {
      from: string;
      content: string;
      attachments?: Attachment[];
    }[];
  };
}

const NotificationButton: React.FC<Props> = ({ messageData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const formatSenderName = (from: string): string => {
    if (!from) return "Unknown";
    const emailRegex = /<[^>]+>/;
    let name = from.replace(emailRegex, "").trim();
    if (from.includes("<lynsanetwork@gmail.com>")) {
      name += " you sent the message.";
    }
    return name;
  };

  const formatContent = (content: string): JSX.Element[] => {
    if (!content) return [<p key="empty" />];
    if (content.includes("<lynsanetwork@gmail.com>")) {
      const parts = content.split("<lynsanetwork@gmail.com>");
      content = parts[0] + "you sent the message.";
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split("\n").map((line, i) => (
      <p key={i} className="text-sm text-gray-700">
        {line.split(urlRegex).map((part, j) =>
          part.match(urlRegex) ? (
            <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  useEffect(() => {
    if (messageData?.replies?.length) {
      const newNotifications = messageData.replies.map((reply) => {
        const processedAttachments = (reply.attachments || []).map((att) => ({
          filename: att.filename || "Unnamed File",
          contentType: att.contentType || "application/octet-stream",
          size: att.size || 0,
          url: att.url || "#",
        }));

        let content = reply.content || "";
        if (content.includes("<lynsanetwork@gmail.com>")) {
          const parts = content.split("<lynsanetwork@gmail.com>");
          content = parts[0] + "you sent the message.";
        }

        return {
          id: Date.now() + Math.random(),
          from: formatSenderName(reply.from),
          content,
          attachments: processedAttachments,
        };
      });

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.content));
        const unique = newNotifications.filter((n) => !existingIds.has(n.content));
        return [...unique, ...prev];
      });

      if (Notification.permission === "granted") {
        newNotifications.forEach((n) => {
          new Notification("New Reply Received", {
            body: `${n.from}\n${n.content.slice(0, 100)}${n.content.length > 100 ? "..." : ""}`,
            icon: "/notification-icon.svg",
          });
        });
      }
    }
  }, [messageData]);

  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎥";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation")) return "📑";
    return "📎";
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="relative bg-transparent border-none cursor-pointer p-2"
      >
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1.5 min-w-[18px] text-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
       <div className="absolute z-50 mt-2 w-[90vw] sm:w-[350px] max-h-[500px] right-0 bg-white rounded-lg shadow-lg overflow-y-auto border border-gray-200">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No new notifications</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 border-b last:border-b-0">
                <div className="font-semibold text-gray-900 mb-1">{n.from}</div>
                <div className="text-sm text-gray-700 mb-2">{formatContent(n.content)}</div>
                {n.attachments.length > 0 && (
                  <div className="pt-2 border-t mt-2">
                    <strong className="text-sm text-gray-800 block mb-1">Attachments:</strong>
                    <ul className="space-y-1">
                      {n.attachments.map((a, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">{getFileIcon(a.contentType)}</span>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {a.filename}
                          </a>
                          <span className="ml-2 text-xs text-gray-500">
                            ({formatFileSize(a.size)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
