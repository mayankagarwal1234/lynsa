import { useState, useEffect, ChangeEvent, FormEvent, useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

interface FormDataState {
  name: string;
  email: string;
  message: string;
  attachment: File | null;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useMessageForm = () => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    message: "",
    attachment: null,
  });

  const { authUser } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [messageData, setMessageData] = useState<any>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (messageId) {
      const pollMessageStatus = async () => {
        try {
          const sanitizedId = messageId.replace(/[<>]/g, "").split("@")[0];
          const response = await fetch(
            `http://localhost:5000/message-status/${sanitizedId}`
          );
          const data = await response.json();
          if (data.success) {
            setMessageData(data.status);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };

      pollMessageStatus();
      pollInterval = setInterval(pollMessageStatus, 10000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [messageId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      attachment: file || null,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const orderRes = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Message Service",
        description: "Send message with attachment",
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: { color: "#3498db" },
        handler: async (response: RazorpayResponse) => {
          try {
            const formPayload = new FormData();
            formPayload.append("name", formData.name);
            formPayload.append("email", formData.email);
            formPayload.append("message", formData.message);
            formPayload.append(
              "razorpayPaymentId",
              response.razorpay_payment_id
            );
            formPayload.append("razorpayOrderId", response.razorpay_order_id);
            formPayload.append(
              "razorpaySignature",
              response.razorpay_signature
            );
            if (authUser) {
              formPayload.append("userId", authUser._id);
            }
            if (formData.attachment) {
              formPayload.append(
                "attachments",
                formData.attachment,
                formData.attachment.name
              );
            }

            const sendRes = await fetch("http://localhost:5000/send-message", {
              method: "POST",
              body: formPayload,
            });

            const sendResult = await sendRes.json();
            if (!sendResult.success) {
              setError(sendResult.message || "Failed to send message");
              return;
            }

            setMessageId(sendResult.messageId);
            setSuccess(true);
            toast.success("Message sent!");

            const convertRes = await fetch("http://localhost:5000/convert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ input: formData.email }),
            });
            const convertResult = await convertRes.json();
            const giantId = convertResult.objectId;

            // === Save to DB ===
            const dbForm = new FormData();
            if (authUser) {
              dbForm.append("userId", authUser._id);
            }
            dbForm.append("giantId", giantId);
            dbForm.append("orderId", orderData.orderId);
            dbForm.append("invoiceId", `inv_${Date.now()}`);
            dbForm.append("razorpayOrderId", response.razorpay_order_id);
            dbForm.append("razorpayPaymentId", response.razorpay_payment_id);
            dbForm.append("razorpaySignature", response.razorpay_signature);
            dbForm.append("note", formData.message);
            if (formData.attachment) {
              dbForm.append(
                "attachments",
                formData.attachment,
                formData.attachment.name
              );
            }

            const dbRes = await fetch(
              "http://localhost:5000/api/payments/create",
              {
                method: "POST",
                body: dbForm,
              }
            );

            const dbResult = await dbRes.json();
            if (!dbResult.success) {
              toast.error("Payment succeeded but saving to PaymentDB failed.");
            }

            const outreachForm = new FormData();
            if (authUser) {
              outreachForm.append("userId", authUser._id);
              outreachForm.append("senderName", authUser.name);
            }
            outreachForm.append("receiverEmail",formData.email );
            outreachForm.append("messageId",sendResult.messageId);
            outreachForm.append("paymentId", response.razorpay_payment_id);
            outreachForm.append("senderMessage", formData.message);
            if (formData.attachment) {
              outreachForm.append(
                "senderAttachment",
                formData.attachment,
                formData.attachment.name
              );
            }
             const outreachRes = await fetch(
              "http://localhost:5000/api/hot-outreach/create",
              {
                method: "POST",
                body: outreachForm,
              }
            );
              const outreachResult = await outreachRes.json();
            if (!outreachResult.success) {
              toast.error("Payment succeeded but saving to HotOutreachDB failed.");
            }

            setFormData({ name: "", email: "", message: "", attachment: null });
          } catch (err) {
            console.error("Error in Razorpay handler:", err);
            setError("Something went wrong after payment.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Failed to create Razorpay order");
      setLoading(false);
    }
  };

  

  return {
    formData,
    loading,
    error,
    success,
    messageId,
    messageData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
  };
};
