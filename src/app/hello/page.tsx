"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function HelloWorld() {
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState({
    sessionId: 'Not set',
    from: 'Not available',
    message: 'No message',
    created: new Date().toLocaleString(),
  });

  useEffect(() => {
    // Get parameters from URL
    const session = searchParams.get('session');
    const from = searchParams.get('from');
    const message = searchParams.get('message');
    
    if (session) {
      setSessionData({
        sessionId: session,
        from: from || 'Not available',
        message: message || 'No message',
        created: new Date().toLocaleString(),
      });
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Hello World!</h1>
      <p className="text-xl mb-8">Welcome to the Twilio Study Hub</p>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Study Session Information</h2>
        <div className="space-y-2">
          <p><strong>Session ID:</strong> <span>{sessionData.sessionId}</span></p>
          <p><strong>From:</strong> <span>{sessionData.from}</span></p>
          <p><strong>Message:</strong> <span>{sessionData.message}</span></p>
          <p><strong>Created:</strong> <span>{sessionData.created}</span></p>
          <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
        </div>
      </div>
    </div>
  );
}
