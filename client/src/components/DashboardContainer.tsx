import { FC, useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface DashboardContainerProps {
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

const DashboardContainer: FC<DashboardContainerProps> = ({
  isDark,
  setIsDark,
  isCollapsed,
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>("");
  const { authUser, onlineUsers } = useContext(AuthContext);
  const { getGiants, users } = useContext(ChatContext);
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
    getGiants();
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
          className={`flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-xl shadow-sm ${
            isDark ? "text-white" : ""
          } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
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

      <div className=" mt-18 overflow-y-auto p-4">
        <div
          className={`ml-2 font-bold ${
            isDark ? "text-white" : ""
          } text-2xl sm:text-3xl mb-4`}
        >
          Welcome Back, {authUser?.name}!
        </div>

        {/* Body content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connect with Experts */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Connect with Experts</h3>
            <div className="max-h-[250px] overflow-y-auto pr-2">
              {filteredUsers.slice(0, 50).map((expert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 mb-3"
                >
                  <div>
                    <h4 className="font-semibold">{expert.name}</h4>
                    <p className="text-sm text-gray-600">{expert.location}</p>
                    <p className="text-sm text-gray-500">{expert.role}</p>
                  </div>
                  <button
                    onClick={() => navigate("/explore")}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
            <strong className="text-lg font-semibold">Message Overview:</strong>
            <div>
              <p className="text-sm">Responded Messages: Connect more to load.</p>
              <p className="text-sm">Avg. Response Time: Connect more to load.</p>
            </div>
            <strong className="text-lg font-semibold mt-4">
              Earning Summary:
            </strong>
            <div>
              <p className="text-sm">Total: Connect more to load.</p>
              <p className="text-sm">Video Calls: Connect more to load.</p>
            </div>
            <strong className="text-lg font-semibold mt-4">
              Profile Engagement:
            </strong>
            <div>
              <p className="text-sm">Total Views: Connect more to load.</p>
              <p className="text-sm">Connection Requests:Connect more to load.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-center">
            <div className="text-center bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold mb-3">Share Your Expertise</h4>
              <p className="text-sm text-gray-600 mb-5">
                Join our platform as a Giant and earn by helping others
              </p>
              <button
                onClick={() =>
                  window.open(
                    "https://docs.google.com/forms/d/e/1FAIpQLSe1px0nNV11Pk_6Oky-GIE2PZE3hzp0TW3NBT-p3hIGnZ7knA/viewform?usp=header",
                    "_blank"
                  )
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
              >
                Apply to Become a Giant
              </button>
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

          {/* Activities Scheduled */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Wallet Overview</h3>
            <p>Coming Soon.....</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Referral Rewards</h3>
            <p>Coming Soon.....</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
