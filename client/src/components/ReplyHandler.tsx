import React from 'react';
import { useMessageStatus } from '../../context/useMessageStatus';
import NotificationHandler from './NotificationHandler';

interface Props {
  messageId: string;
}

const ReplyHandler: React.FC<Props> = ({ messageId }) => {
  const { messageData, loading, error } = useMessageStatus(messageId);

  const formatDate = (timestamp: string | undefined): string =>
    timestamp ? new Date(timestamp).toLocaleString() : 'Not available';

  if (loading) return <div className="text-sm text-gray-500">Loading message status...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;
  if (!messageData) return <div className="text-red-500 text-sm">No message data available</div>;

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      <NotificationHandler messageData={messageData} />

      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-gray-700">Message Status</h4>
        <p><strong>Status:</strong> {messageData.status || 'Pending'}</p>
        <p><strong>Recipient:</strong> {messageData.recipient || 'Not available'}</p>
        <p><strong>Sent At:</strong> {formatDate(messageData.timestamp)}</p>
      </div>

      {messageData.replies?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Replies</h4>
          <div className="space-y-3">
            {messageData.replies.map((reply, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                <p><strong>From:</strong> {reply.from || 'Unknown'}</p>
                <p><strong>Subject:</strong> {reply.subject || 'No subject'}</p>
                <p><strong>Time:</strong> {formatDate(reply.timestamp)}</p>
                <div className="text-gray-700 mt-2">{reply.content || 'No content'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyHandler;
