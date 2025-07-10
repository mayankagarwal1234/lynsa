import React, { useEffect } from 'react';
import NotificationButton from './NotificationButton';

interface Reply {
  from: string;
  subject: string;
  content: string;
}

interface MessageData {
  replies?: Reply[];
}

interface Props {
  messageData: MessageData;
}

const NotificationHandler: React.FC<Props> = ({ messageData }) => {
  useEffect(() => {
    const latestReply = messageData?.replies?.slice(-1)[0];
    if (!latestReply) return;

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification('New Reply Received', {
        body: `From: ${latestReply.from}\nSubject: ${latestReply.subject}\n\n${latestReply.content.substring(0, 100)}${latestReply.content.length > 100 ? '...' : ''}`,
        icon: '/logo192.png',
      });
    }
  }, [messageData]);

  return <NotificationButton messageData={messageData} />;
};

export default NotificationHandler;
