import { FC, useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface GiantContainerProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  isCollapsed?: boolean;
}
interface Meeting {
  requestId: string;
  subject: string;
  requesterName: string;
  requesterUserId: string;
  requesterEmail?: string;
  recipientUserId: string;
  message?: string;
  selectTime?: string;
  selectDate: string;
  hmsHostJoinUrl?: string;
  hmsGuestJoinUrl?: string;
  status:
    | "pending_approval"
    | "approved"
    | "completed"
    | "rejected"
    | "modified";
}

const GiantContainer: FC<GiantContainerProps> = ({
  isDark,
  setIsDark,
  isCollapsed,
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>("");

  const { authUser, onlineUsers } = useContext(AuthContext);
  const { getPayments, users, payments } = useContext(ChatContext);
  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);

  const meetingDates = new Set(
    scheduledMeetings.map((meeting) =>
      new Date(
        `${meeting.selectDate.slice(0, 10)}T${meeting.selectTime}:00`
      ).toDateString()
    )
  );

  const filteredUsers = input
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(input.toLowerCase()) ||
          user.Title.toLowerCase().includes(input.toLowerCase()) ||
          user.skills?.some((skill) =>
            skill.toLowerCase().includes(input.toLowerCase())
          )
      )
    : users;

  useEffect(() => {
    getPayments();
    fetchScheduledMeetings();
  }, [onlineUsers]);

  const fetchScheduledMeetings = async () => {
    try {
      const res = await axios.get(
        `/api/meetings/user/${authUser._id}/approved-meetings`
      );
      if (res.data.success) setScheduledMeetings(res.data.data || []);
    } catch {
      console.error("Failed to load scheduled meetings");
    }
  };

  return (
    <div
      className={`w-full h-full shadow-md flex flex-col overflow-hidden ${
        isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-[#1A1A1A]"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
      }`}
    >
      {/* Header */}
      <div
        className={`fixed top-0 z-20 p-4 flex flex-wrap gap-4 items-center justify-between bg-opacity-70 transition-all duration-300 ${
          isCollapsed ? "left-[100px]" : "left-[250px]"
        } right-0`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-xl ${
            isDark ? "text-white" : ""
          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
          placeholder="Search by name, Title, or skills..."
        />

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

      {/* Main Content */}
      <div className="mt-18 overflow-y-auto p-4">
        <div
          className={`ml-2 font-bold ${
            isDark ? "text-white" : ""
          } text-2xl sm:text-3xl mb-4`}
        >
          Welcome Back, {authUser?.name}!
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 🔥 Recent Payments Section */}
          <div className="col-span-1 sm:col-span-2 bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Message Request</h3>
            <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-2">
              {payments.map((payment, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={payment.userId?.profilePic || assets.avatar_icon}
                      alt={payment.userId?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{payment.userId?.name}</p>
                      <p className="text-sm text-gray-500">
                        Email: {payment.userId?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Message: {payment.note}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm sm:min-w-[120px]">
                    <p className="text-gray-500">
                      {new Date(payment.timestamp).toLocaleDateString()}
                    </p>
                    {payment.attachments?.[0] && (
                      <a
                        href={payment.attachments[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-xs"
                      >
                        View File
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <strong className="text-lg font-semibold">
                Message Overview:
              </strong>
              <p className="text-sm">Responded Messages: Connect more to load.</p>
              <p className="text-sm">Avg. Response Time: Connect more to load.</p>
            </div>

            <div className="space-y-1 mt-4">
              <strong className="text-lg font-semibold">
                Earning Summary:
              </strong>
              <p className="text-sm">Total: Connect more to load.</p>
              <p className="text-sm">Video Calls: Connect more to load.</p>
            </div>

            <div className="space-y-1 mt-4">
              <strong className="text-lg font-semibold">
                Profile Engagement:
              </strong>
              <p className="text-sm">Total Views: Connect more to load.</p>
              <p className="text-sm">Connection Requests: Connect more to load.</p>
            </div>
          </div>

          
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Upcoming Video Calls</h3>

            <Calendar
              tileClassName={({ date, view }) =>
                view === "month" && meetingDates.has(date.toDateString())
                  ? "highlight-tile"
                  : null
              }
            />

            <div className="mt-4">
              {scheduledMeetings.length > 0 ? (
                scheduledMeetings.map((meeting) => {
                  const scheduledDateTime = new Date(
                    `${meeting.selectDate.slice(0, 10)}T${
                      meeting.selectTime
                    }:00`
                  );
                  return (
                    <div
                      key={meeting.requestId}
                      className="border rounded p-3 mb-2"
                    >
                      <div className="font-semibold">{meeting.subject}</div>
                      <div className="text-sm text-gray-600">
                        On: {scheduledDateTime.toLocaleDateString()}
                        <p>At: {meeting.selectTime}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        With: {meeting.recipientUserId}
                      </div>
                      {meeting.hmsGuestJoinUrl && (
                        <a
                          href={
                            scheduledDateTime <= new Date()
                              ? meeting.hmsGuestJoinUrl
                              : undefined
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                            scheduledDateTime <= new Date()
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            if (scheduledDateTime > new Date())
                              e.preventDefault();
                          }}
                        >
                          Join
                        </a>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No scheduled meetings.</p>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Wallet Overview</h3>
            <p>Coming Soon.....</p>
          </div>

          {/* Referral */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Referral Rewards</h3>
            <p>Coming Soon.....</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiantContainer;
