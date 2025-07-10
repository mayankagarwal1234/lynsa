import React, { useState, DragEvent, ChangeEvent, useContext } from "react";
import { X, Upload, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  contact?: string;
  costToConnect?: number;
  email?: string;
}

interface ConnectModalProps {
  selectedUser: User | null;
  showConnectModal: boolean;
  setShowConnectModal: (value: boolean) => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({
  selectedUser,
  showConnectModal,
  setShowConnectModal,
}) => {
  const { authUser } = useContext(AuthContext);
  const [message, setMessage] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setAttachment(file);
    } else {
      toast.error("File size must be less than 5MB");
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setAttachment(file);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const existing = document.querySelector(
        "script[src='https://checkout.razorpay.com/v1/checkout.js']"
      );
      if (existing) return resolve(true); // already loaded

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!message.trim() || !selectedUser || !authUser) {
      toast.error("Message or user info missing.");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your internet.");
      return;
    }

    fetch("http://localhost:5000/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: selectedUser.costToConnect || 1,
        description: `Connect with ${selectedUser.name}`,
        userId: authUser._id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.orderId || !data.keyId)
          throw new Error("Invalid Razorpay order response");

        const orderId = data.orderId;
        const invoiceId = `inv_${Date.now()}`;

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: orderId,
          name: "Lynsa Connect",
          description: `Payment to connect with ${selectedUser.name}`,
          prefill: {
            name: authUser.name,
            email: authUser.email,
            contact: authUser.contact || "",
          },
          handler: (response: any) => {
            const formData = new FormData();
            formData.append("razorpayOrderId", response.razorpay_order_id);
            formData.append("razorpayPaymentId", response.razorpay_payment_id);
            formData.append("razorpaySignature", response.razorpay_signature);
            formData.append("userId", authUser._id);
            formData.append("giantId", selectedUser._id);
            formData.append("orderId", orderId);
            formData.append("invoiceId", invoiceId);
            formData.append("note", message);
            if (attachment)
              formData.append("attachments", attachment, attachment.name);
            fetch("http://localhost:5000/api/payments/create", {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  setShowConnectModal(false);
                  navigate("/chat");
                } else {
                  toast.error("Payment succeeded but saving message failed.");
                }
              })
              .catch((err) => {
                console.error("Payment save error:", err);
                toast.error(
                  "Payment done but failed to record. Contact support."
                );
              });
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      })
      .catch((error) => {
        console.error("Payment init error:", error);
        toast.error("Failed to initiate payment. Try again.");
      });
  };

  if (!showConnectModal || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Connect with {selectedUser.name}
            </h3>
            <p className="text-sm text-gray-500">
              Send a message to start the conversation
            </p>
          </div>
          <button
            onClick={() => {
              setMessage("");
              setAttachment(null);
              setShowConnectModal(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Write your message here..."
          />
          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-500">
              {message.length}/1000 characters
            </span>
            <span
              className={
                message.length > 900 ? "text-red-500" : "text-gray-400"
              }
            >
              {1000 - message.length} remaining
            </span>
          </div>
        </div>

        {/* File Attachment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Attachment (Optional)
          </label>
          <div
            className={`border-2 border-dashed rounded-xl px-6 py-2 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : attachment
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {attachment ? (
              <div className="text-green-700">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5 mr-2" />
                  File Selected
                </div>
                <p className="text-sm font-medium">{attachment.name}</p>
                <p className="text-xs">
                  {(attachment.size / 1024 / 1024).toFixed(2)}MB
                </p>
                <button
                  onClick={() => setAttachment(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-gray-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm mb-1">Drop your file here or</p>
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  browse files
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
                <p className="text-xs mt-1">Max file size: 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Connection Fee
              </p>
              <p className="text-xs text-gray-600">
                Secure payment via Razorpay
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ₹{selectedUser.costToConnect || 50}
              </p>
            </div>
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
          onClick={handlePayment}
          disabled={!message.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-5 h-5 mr-2" />
          Send Message & Pay ₹{selectedUser.costToConnect || 50}
        </button>
      </div>
    </div>
  );
};

export default ConnectModal;
