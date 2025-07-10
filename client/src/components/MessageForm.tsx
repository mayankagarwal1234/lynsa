import React, { useEffect } from "react";
import { useMessageForm } from "../../context/UseMessageForm";

interface Props {
  onMessageSent: (data: any) => void;
  setLatestMessageId: (id: string) => void;
}

const MessageForm: React.FC<Props> = ({
  onMessageSent,
  setLatestMessageId,
}) => {
  const {
    formData,
    loading,
    error,
    success,
    messageId,
    messageData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
  } = useMessageForm();

  useEffect(() => {
    if (messageId) {
      onMessageSent(messageData);
      setLatestMessageId(messageId);
    }
  }, [success, messageId, messageData, onMessageSent, setLatestMessageId]);

  return (
    <div className="bg-gradient-to-br from-[#dce7f8] to-[#e9ecf6] rounded-xl sm:p-8 p-6 w-full max-w-xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-[#1A1A1A] mb-6">
        Your next connection is just a hot outreach away
      </h2>

      {!success ? (
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-5">
            <label
              className="block mb-2 font-medium text-gray-700"
              htmlFor="name"
            >
              Your Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label
              className="block mb-2 font-medium text-gray-700"
              htmlFor="email"
            >
              Recipient's Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          {/* Message */}
          <div className="mb-5">
            <label
              className="block mb-2 font-medium text-gray-700"
              htmlFor="message"
            >
              Your Message (Max 1000 characters)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              maxLength={1000}
              required
              className="w-full p-3 border border-gray-300 rounded-md bg-white min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.message.length} / 1000
            </div>
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label
              className="block mb-2 font-medium text-gray-700"
              htmlFor="attachment"
            >
              Attachment (Max 5MB)
            </label>
            <div className="flex items-center gap-4 relative">
              <label className="bg-[#3B82F6] text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                Choose File
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  onChange={handleFileChange}
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <span className="text-sm text-gray-700 truncate max-w-[200px]">
                {formData.attachment?.name || "No file chosen"}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mb-2 text-center">
            Send your super-important message with money to warm up your cold
            outreach.
            <br />
            If you don't receive a reply in 20 days, your money will be refunded
            after deducting charges.
          </p>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold text-white transition-all shadow text-sm sm:text-base ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-[#3B82F6] hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Pay ₹1 and Send"}
          </button>
        </form>
      ) : (
        <div className="text-center bg-blue-50 border border-blue-300 rounded-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-700 mb-1">
            Your message has been sent and is waiting for a reply.
          </p>
          <p className="text-gray-600 text-sm">Message ID: {messageId}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 text-center p-3 mt-4 rounded-md">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default MessageForm;
