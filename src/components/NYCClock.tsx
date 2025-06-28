import React, { useState, useEffect } from 'react';

export default function NYCClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nycTime = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
      setTime(nycTime);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="tabular-nums">
      {time || '12:00:00 AM'}
    </span>
  );
} 