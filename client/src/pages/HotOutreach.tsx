import React, { useEffect, useState } from "react";
import MessageForm from "../components/MessageForm";
import MessageHistory from "../components/MessageHistory";
import MainSidebar from "../components/MainSidebar";
import { Helmet } from "react-helmet";

interface HotOutreachProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const HotOutreach: React.FC<HotOutreachProps> = ({ isDark, setIsDark }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);

  useEffect(() => {
  const storedId = localStorage.getItem("latestMessageId");
  if (storedId) {
    setLatestMessageId(storedId);
  }
}, []);

// Whenever it changes, store to localStorage
useEffect(() => {
  if (latestMessageId) {
    localStorage.setItem("latestMessageId", latestMessageId);
  }
}, [latestMessageId]);

  return (
    <div className="w-full h-screen">
       <Helmet>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YNLRKR5B36"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YNLRKR5B36');
          `}
        </script>
      </Helmet>
      <div
        className={`border border-gray-600 rounded-lg overflow-hidden h-full grid relative transition-all duration-300 ${
          isCollapsed ? "grid-cols-[100px_auto]" : "grid-cols-[250px_auto]"
        }`}
      >
        <MainSidebar
          isDark={isDark}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Section - Form & Notification */}
        <div
          className={`flex flex-col items-center justify-start px-4 py-8 overflow-y-auto ${
            isDark
              ? "bg-gradient-to-br from-[#325fe5] to-[#011755] text-[#1A1A1A]"
              : "bg-gradient-to-br from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
          }`}
        >
          <div className="w-full max-w-3xl  rounded-xl  p-6 space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className={`text-2xl ${isDark?"text-white":""} sm:text-3xl ml-4 sm:ml-65 font-bold text-blue-900`}>
                Hot Outreach
              </h1>
              <div className="flex items-center gap-4 ml-auto">
                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={(e) => setIsDark(e.target.checked)}
                    checked={isDark}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>
            </div>

            {/* Message Form */}
            <MessageForm onMessageSent={() => {}} setLatestMessageId={setLatestMessageId}/>
            
            {/* Message History */}
            <MessageHistory isDark={isDark} latestMessageId={latestMessageId}  />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotOutreach;
