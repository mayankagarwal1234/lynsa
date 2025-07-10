import { useState, useEffect } from 'react';
import axios from 'axios';

interface MessageData {
  // Replace with the actual structure of messageData returned by your backend
  status: string;
  timestamp?: string;
  [key: string]: any;
}

interface UseMessageStatusResult {
  messageData: MessageData | null;
  loading: boolean;
  error: string | null;
}

export const useMessageStatus = (messageId: string): UseMessageStatusResult => {
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessageStatus = async () => {
      try {
        const response = await axios.get<MessageData>(`http://localhost:5000/message-status/${messageId}`);
        setMessageData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch message status');
        console.error('Error fetching message status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessageStatus();
    const interval = setInterval(fetchMessageStatus, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [messageId]);

  return {
    messageData,
    loading,
    error,
  };
};
