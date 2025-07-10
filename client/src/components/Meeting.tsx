import { FC, useState, useEffect, ChangeEvent, useContext } from "react";
import {
  Calendar,
  User,
  MessageSquare,
  Video,
  Check,
  X,
  Edit3,
  Plus,
  X as XIcon,
  Clock,
} from "lucide-react";
import axios from "axios";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

interface MeetingProps {
  isDark: boolean;
  isMobile: boolean;
  setIsDark: (value: boolean) => void;
}

interface Profile {
  _id: string;
  name: string;
  location?: string;
  role?: string;
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

const Meeting: FC<MeetingProps> = ({ isDark, isMobile, setIsDark }) => {
  const { authUser } = useContext(AuthContext);
  const { getGiants, users } = useContext(ChatContext);

  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [connectedProfiles, setConnectedProfiles] = useState<Profile[]>([]);
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([]);
  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  const [input, setInput] = useState("");
  const [meetWithSearch, setMeetWithSearch] = useState("");
  const [showMeetWithDropdown, setShowMeetWithDropdown] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMeetingId, setRejectMeetingId] = useState<string | null>(null);

  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyMeetingId, setModifyMeetingId] = useState<string | null>(null);
  const [modifyDate, setModifyDate] = useState("");
  const [modifyTime, setModifyTime] = useState("");

  const [formData, setFormData] = useState({
    purpose: "",
    hostName: authUser?.name || "",
    hostEmail: authUser?.email || "",
    meetWith: "",
    meetWithUserId: "",
    message: "",
    date: "",
    time: "",
  });

  const currentUserId = authUser?._id || "guest";

  useEffect(() => {
    getGiants();
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    updateAvailableProfiles(input);
  }, [input, users]);

  useEffect(() => {
    fetchPendingMeetings();
    fetchScheduledMeetings();
  }, []);

  const updateAvailableProfiles = (filter: string) => {
    const lowerFilter = filter.toLowerCase();
    const filtered = users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(lowerFilter) ||
          u.Title?.toLowerCase().includes(lowerFilter) ||
          u.skills?.some((skill: string) =>
            skill.toLowerCase().includes(lowerFilter)
          )
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
        location: u.location || "",
        role: u.role || "",
      }));
    setAvailableProfiles(filtered);
  };

  const fetchPendingMeetings = async () => {
    try {
      const res = await axios.get(
        `/api/meetings/user/${currentUserId}/pending-requests`
      );
      if (res.data.success) setPendingMeetings(res.data.data || []);
    } catch {
      console.error("Failed to load pending meetings");
    }
  };

  const fetchScheduledMeetings = async () => {
    try {
      const res = await axios.get(
        `/api/meetings/user/${currentUserId}/approved-meetings`
      );
      if (res.data.success) setScheduledMeetings(res.data.data || []);
    } catch {
      console.error("Failed to load scheduled meetings");
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMeetWithChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMeetWithSearch(e.target.value);
    setShowMeetWithDropdown(true);
    setFormData({ ...formData, meetWith: e.target.value, meetWithUserId: "" });
  };

  const handleSelectMeetWith = (profile: Profile) => {
    setFormData({
      ...formData,
      meetWith: profile.name,
      meetWithUserId: profile._id,
    });
    setMeetWithSearch(profile.name);
    setShowMeetWithDropdown(false);
  };

  const handleScheduleMeeting = async () => {
    if (
      !formData.purpose ||
      !formData.hostName ||
      !formData.hostEmail ||
      !formData.meetWithUserId ||
      !formData.date ||
      !formData.time
    ) {
      setStatusMessage("Please fill all fields");
      return;
    }
    try {
      const payload = {
        requesterName: formData.hostName,
        requesterEmail: formData.hostEmail,
        requesterUserId: authUser?._id,
        recipientUserId: formData.meetWithUserId,
        subject: formData.purpose,
        message: formData.message,
        selectDate: formData.date,
        selectTime: formData.time,
      };
      const res = await axios.post("/api/meetings/meeting-request", payload);
      if (res.data.success) {
        const { razorpayOrderId, amount, currency, key, requestId } =
          res.data.data;
        const options = {
          key,
          amount,
          currency,
          order_id: razorpayOrderId,
          name: "Meeting Payment",
          description: `Payment for meeting: ${formData.purpose}`,
          handler: async (response: any) =>
            await verifyPayment(response, requestId),
          prefill: { name: formData.hostName, email: formData.hostEmail },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch {
      setStatusMessage("Error creating meeting.");
    }
  };

  const verifyPayment = async (paymentData: any, requestId: string) => {
    try {
      const res = await axios.post("/api/meetings/verify-payment", {
        ...paymentData,
        requestId,
      });
      if (res.data.success) {
        setStatusMessage("Payment verified. Meeting pending approval.");
        fetchScheduledMeetings();
      } else {
        setStatusMessage("Payment verification failed.");
      }
    } catch {
      setStatusMessage("Verification failed.");
    }
  };

  const handleApproveMeeting = async (
    requestId: string,
    date: string,
    time: string
  ) => {
    try {
      if (!date || !time) {
        console.error("Cannot approve: missing date or time");
        return;
      }

      console.log("Approving with payload:", {
        dateTime: `${date}T${time}:00`,
      });

      await axios.post(`/api/meetings/meeting-request/${requestId}/approve`, {
        dateTime: `${date}T${time}:00`,
      });

      fetchPendingMeetings();
      fetchScheduledMeetings();

      setModifyMeetingId(null);
      setModifyDate("");
      setModifyTime("");
    } catch (err) {
      console.error("Error approving meeting:", err);
    }
  };

  const handleRejectMeeting = async () => {
    if (!rejectMeetingId) return;
    await axios.post(
      `/api/meetings/meeting-request/${rejectMeetingId}/reject`,
      { reason: rejectReason }
    );
    setShowRejectModal(false);
    setRejectMeetingId(null);
    fetchPendingMeetings();
  };

  const handleModifyMeeting = async () => {
    if (!modifyMeetingId) return;
    try {
      await axios.post(
        `/api/meetings/meeting-request/${modifyMeetingId}/approve`,
        {
          dateTime: `${modifyDate}T${modifyTime}:00`,
        }
      );
      setShowModifyModal(false);
      setModifyMeetingId(null);
      fetchPendingMeetings();
      fetchScheduledMeetings();
    } catch (err) {
      console.error("Error modifying meeting:", err);
    }
  };

  function renderMeetingCard(meeting: Meeting) {
    const scheduledDateTime = new Date(
      `${meeting.selectDate.slice(0, 10)}T${meeting.selectTime}:00`
    );
    const now = new Date();

    const isJoinAllowed = now >= scheduledDateTime;

    return (
      <div
        key={meeting.requestId}
        className="border p-4 rounded mb-3 bg-white shadow-sm hover:shadow-md transition w-full"
      >
        <h3 className="font-semibold break-words">{meeting.subject}</h3>

        <div className="flex flex-wrap items-center text-sm text-gray-600 mt-1">
          <User className="w-4 h-4 mr-1" />
          <span className="break-all">{meeting.requesterName}</span>
          <Calendar className="w-4 h-4 mx-2" />
          {scheduledDateTime.toLocaleDateString()}
          <Clock className="w-4 h-4 sm:mx-2 mt-2 sm:mt-0" />
          <p className="mt-2 sm:mt-0">{meeting.selectTime ?? "TBD"}</p>
        </div>

        {meeting.message && (
          <div className="mt-2 flex text-sm break-words">
            <MessageSquare className="w-4 h-4 mr-1 shrink-0" />
            <p className="flex-1  break-words max-w-full mr-1">
              {meeting.message}
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {meeting.status === "pending_approval" &&
            currentUserId !== meeting.requesterUserId && (
              <>
                <button
                  onClick={() => {
                    handleApproveMeeting(
                      meeting.requestId,
                      meeting.selectDate.slice(0, 10),
                      meeting.selectTime
                    );
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    setRejectMeetingId(meeting.requestId);
                    setShowRejectModal(true);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => {
                    setModifyMeetingId(meeting.requestId);
                    setShowModifyModal(true);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                >
                  <Edit3 className="w-4 h-4" /> Modify
                </button>
              </>
            )}
          {meeting.requesterUserId === currentUserId
            ? meeting.hmsGuestJoinUrl && (
                <a
                  href={isJoinAllowed ? meeting.hmsGuestJoinUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                    isJoinAllowed
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!isJoinAllowed) e.preventDefault();
                  }}
                >
                  <Video className="w-4 h-4" /> Join
                </a>
              )
            : meeting.hmsHostJoinUrl && (
                <a
                  href={isJoinAllowed ? meeting.hmsHostJoinUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                    isJoinAllowed
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!isJoinAllowed) e.preventDefault();
                  }}
                >
                  <Video className="w-4 h-4" /> Join
                </a>
              )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-full  ${
        isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-[#1A1A1A]"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
      }`}
    >
      {/* Left side */}
      {!isMobile && (
        <div className="w-2/5 p-6 overflow-y-auto">
          <input
            type="text"
            placeholder="Search Profile"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              updateAvailableProfiles();
            }}
            className={`w-full px-4 py-2 border  mb-6 rounded-lg ${
              isDark
                ? "border-white text-white"
                : "border-gray-800 text-[#1A1A1A]"
            }`}
          />
          <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : ""}`}>
            Available Profiles
          </h3>
          {availableProfiles.map((profile) => (
            <div
              key={profile._id}
              className="flex justify-between items-center p-3 border text-[#1A1A1A] bg-white rounded mb-2"
            >
              <div>
                <div className="font-semibold">{profile.name}</div>
                <div className="text-xs text-gray-500">{profile.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="w-3/5 sm:w-full md:w-3/5 p-4 md:p-6 mt-0 overflow-y-auto">
        {isMobile && (
          <div className="flex items-center mx-40 mb-4">
            {/* Dark mode toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={(e) => setIsDark(e.target.checked)}
                checked={isDark}
              />
              <div
                className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
            after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
            peer-checked:bg-gray-600"
              ></div>
            </label>
          </div>
        )}
        <div
          className={`p-6 px-2 sm:px-6 rounded-lg border mb-6 shadow 
    ${isDark ? "bg-white " : "bg-white/60 border-gray-300"}`}
        >
          <h2 className="text-xl font-semibold mb-4">Schedule Meeting</h2>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            className="w-full mb-3 px-4 py-2 border rounded bg-transparent backdrop-blur"
            placeholder="Purpose"
          />
          <div className="flex flex-col md:flex-row gap-4 mb-3">
            <input
              type="text"
              name="hostName"
              value={formData.hostName}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 border rounded bg-transparent backdrop-blur"
              placeholder="Host Name"
            />
            <input
              type="email"
              name="hostEmail"
              value={formData.hostEmail}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 border rounded bg-transparent backdrop-blur"
              placeholder="Host Email"
            />
          </div>

          <div className="relative mb-3">
            <input
              type="text"
              value={meetWithSearch}
              onChange={handleMeetWithChange}
              className="w-full px-4 py-2 border rounded bg-transparent backdrop-blur"
              placeholder="Meet with"
            />
            {showMeetWithDropdown && (
              <div
                className={`absolute bg-white/90 border rounded w-full mt-1 z-10 ${
                  isDark ? "text-black" : ""
                }`}
              >
                {availableProfiles
                  .filter((p) =>
                    p.name.toLowerCase().includes(meetWithSearch.toLowerCase())
                  )
                  .map((profile) => (
                    <div
                      key={profile._id}
                      onClick={() => handleSelectMeetWith(profile)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {profile.name}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full mb-3 px-4 py-2 border rounded bg-transparent backdrop-blur"
            placeholder="Message"
          />

          <div className="flex flex-col md:flex-row gap-4 mb-3">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 border rounded bg-transparent backdrop-blur"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 border rounded bg-transparent backdrop-blur"
            />
          </div>
          <p className="text-[10px] mt-5 text-gray-500 mb-2 text-center">
            Send your super-important meeting with money to warm up your cold
            outreach.
            <br />
            If your meeting request is not approved, In 10 days your money will
            be refunded after deducting charges.
          </p>
          <button
            onClick={handleScheduleMeeting}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Schedule & Pay
          </button>
          {statusMessage && (
            <p className="mt-3 text-center text-blue-300">{statusMessage}</p>
          )}
        </div>

        {/* Pending Meetings */}
        {pendingMeetings.length > 0 && (
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : ""
              }`}
            >
              Pending Meetings
            </h3>
            {pendingMeetings.map((meeting) => renderMeetingCard(meeting))}
          </div>
        )}

        {/* Scheduled Meetings */}
        <div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              isDark ? "text-white" : ""
            }`}
          >
            Scheduled Meetings
          </h3>
          {scheduledMeetings.length > 0 ? (
            scheduledMeetings.map((meeting) => renderMeetingCard(meeting))
          ) : (
            <p className={`${isDark ? "text-white" : "text-gray-500"}`}>
              No scheduled meetings.
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRejectModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-4">Reject Meeting</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
              placeholder="Reason"
            />
            <button
              onClick={handleRejectMeeting}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {showModifyModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-4">Modify Meeting Time</h3>
            <input
              type="date"
              value={modifyDate}
              onChange={(e) => setModifyDate(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded"
            />
            <input
              type="time"
              value={modifyTime}
              onChange={(e) => setModifyTime(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />
            <button
              onClick={handleModifyMeeting}
              className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meeting;
