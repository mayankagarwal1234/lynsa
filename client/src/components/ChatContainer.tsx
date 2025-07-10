import {
  useContext,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { formatMessageTime } from "../lib/util";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface ChatContainerProps {
  setIsHidden: (value: boolean) => void;
  isHidden: boolean;
  isDark: boolean;
  isMobile: boolean;
  showRightSidebar:boolean
  setIsDark: (value: boolean) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  setIsHidden,
  isHidden,
  isDark,
  setIsDark,
  isMobile,
}) => {
  const [input, setInput] = useState<string>("");
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();

  const scrollEnd = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [initialScrolled, setInitialScrolled] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages.length > 0 && !userScrolled) {
      scrollEnd.current.scrollIntoView({
        behavior: initialScrolled ? "smooth" : "auto",
      });
      if (!initialScrolled) setInitialScrolled(true);
    }
  }, [messages, userScrolled, initialScrolled]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    try {
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleSendFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return toast.error("Select a valid file");

    const isImage = file.type.startsWith("image/");
    const isDocument = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(file.type);

    if (!isImage && !isDocument) return toast.error("Unsupported file type");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        if (isImage) {
          await sendMessage({ image: base64 });
        } else {
          await sendMessage({
            files: [{ data: base64, fileName: file.name, fileType: file.type }],
          });
        }
        toast.success("File sent!");
      } catch {
        toast.error("Failed to send file");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`w-full h-full shadow-md flex flex-col overflow-hidden ${
        isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
      }`}
    >


      {/* Navbar */}
{isMobile &&<div className={`z-20 w-full flex justify-between items-center px-4 py-3 gap-4
 `}>
  {selectedUser && !isHidden && (
    <img
       onClick={() => {
              navigate("/chat");
              setSelectedUser(null);
       }}
      className={`w-6 h-6  cursor-pointer ${
        isDark ? "filter brightness-0 invert" : "invert"
      }`}
      src={assets.arrow_icon}
      alt=""
    />
  )}
  <div className="flex items-center gap-4 ml-auto">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        onChange={(e) => setIsDark(e.target.checked)}
        checked={isDark}
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
    </label>
    <img
      src={authUser?.profilePic || assets.avatar_icon}
      onClick={() => navigate("/profile")}
      alt="avatar"
      className="w-9 h-9 border border-gray-400 rounded-full object-cover shadow cursor-pointer"
    />
  </div>
</div>
}


      {/* Chat Panel */}
    <div className={`${isMobile?"pt-[10px]":"pt-[70px]"} h-full relative`}>
        <div className="flex items-center gap-3 py-4 px-5">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <p className="flex-1 text-lg flex items-center gap-2">
            {selectedUser?.name || "Unknown"}
            {selectedUser && onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </p>
          <img
            src={assets.video}
            onClick={() => navigate("/video")}
            alt="video"
            className={`w-9 h-9 rounded-full object-cover cursor-pointer ${
              isDark ? "invert brightness-0" : ""
            }`}
          />
         
        </div>

        <div className="h-[1px] mx-2 border-b border-gray-300 shadow-sm shadow-gray-200" />

        <div
          ref={messageContainerRef}
          onScroll={() => {
            if (!messageContainerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } =
              messageContainerRef.current;
            const isNearBottom =
              scrollHeight - scrollTop - clientHeight < 100;
            setUserScrolled(!isNearBottom);
          }}
          className="flex flex-col h-[calc(100%-180px)] overflow-y-auto p-4 space-y-2 scroll-smooth"
        >
          {messages.map((msg, index) => {
            const isSender = msg.senderId === authUser?._id;
            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2 ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                {!isSender && (
                  <div className="text-center text-xs">
                    <img
                      src={selectedUser?.profilePic || assets.avatar_icon}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <p className="text-gray-500">
                      {msg.createdAt ? formatMessageTime(msg.createdAt) : ""}
                    </p>
                  </div>
                )}

                <div>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="sent"
                      className="max-w-[230px] border border-gray-400 rounded-xl overflow-hidden shadow mb-6"
                    />
                  )}

                  {msg.files?.length > 0 &&
                    msg.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-[230px] px-4 py-2 text-sm bg-yellow-100 text-black rounded-xl mb-2 shadow underline"
                      >
                        {file.fileName}
                      </a>
                    ))}

                  {msg.text && (
                    <p
                      className={`px-4 py-2 text-sm max-w-[230px] font-light rounded-xl mb-6 ${
                        isSender
                          ? isDark
                            ? "bg-blue-400 text-black rounded-br-none"
                            : "bg-blue-500 text-black rounded-br-none"
                          : isDark
                          ? "bg-[#2e3b55] text-white rounded-bl-none"
                          : "bg-gray-200 text-black rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}
                </div>

                {isSender && (
                  <div className="text-center text-xs">
                    <img
                      src={authUser?.profilePic || assets.avatar_icon}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <p className="text-gray-500">
                      {msg.createdAt ? formatMessageTime(msg.createdAt) : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollEnd}></div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-transparent"
        >
          <div className="flex-1 flex items-center px-3 rounded-full shadow bg-white">
            <input
              type="text"
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              placeholder="Send a message"
              className={`flex-1 text-sm p-2 border-none rounded-lg bg-transparent outline-none ${
                isDark
                  ? "text-black placeholder:text-gray-400"
                  : "text-black placeholder:text-gray-500"
              }`}
            />
            <input
              type="file"
              onChange={handleSendFile}
              id="image"
              accept=".xlsx,.xls,.csv,.ppt,.pptx,.doc,.docx,.pdf,image/jpeg,image/jpg,image/png"
              hidden
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt="gallery"
                className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>
          <button type="submit">
            <img
              src={assets.send_button}
              alt="send"
              className="w-7 cursor-pointer"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
