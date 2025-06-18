"use client";

import React, { Suspense, useState } from 'react';

// Client component that uses navigation hooks
function MessageForm() {
  // We'll use a ref to store the router for navigation after form submission
  const routerRef = React.useRef<any>(null);
  
  const [formData, setFormData] = useState({
    phoneNumber: '+15551234567', // Default placeholder
    message: 'Hello, I need help with my studies!',
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null as string | null,
    response: null as any,
  });
  
  // Load the router dynamically to avoid SSG issues
  React.useEffect(() => {
    import('next/navigation').then(({ useRouter }) => {
      routerRef.current = useRouter();
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null, response: null });

    try {
      // Create form data similar to what Twilio would send
      const twilioFormData = new FormData();
      twilioFormData.append('From', formData.phoneNumber);
      twilioFormData.append('Body', formData.message);

      // Send to our webhook endpoint
      const response = await fetch('/api/twilio-webhook', {
        method: 'POST',
        body: twilioFormData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.text();
      setStatus({
        loading: false,
        success: true,
        error: null,
        response: responseData,
      });

      // Extract URL from TwiML response
      const urlMatch = responseData.match(/Here's your study session link: (http[^<]+)/);
      if (urlMatch && urlMatch[1]) {
        // Wait a moment before redirecting
        setTimeout(() => {
          // Use the router ref instead of direct router access
          if (routerRef.current) {
            routerRef.current.push(urlMatch[1]);
          } else {
            // Fallback if router isn't available yet
            window.location.href = urlMatch[1];
          }
        }, 3000);
      }
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        response: null,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Send a Message to Twilio</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Your Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+15551234567"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              status.loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status.loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        
        {status.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p className="text-sm">{status.error}</p>
          </div>
        )}
        
        {status.success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-medium">Success!</p>
            <p className="text-sm">Message sent successfully. Redirecting to study session page...</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">View Response</summary>
              <pre className="mt-2 p-2 bg-gray-100 overflow-x-auto text-xs">
                {status.response}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          This form simulates sending a message to your Twilio webhook.
          <br />
          In a real scenario, messages would come directly from Twilio.
        </p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Send a Message to Twilio</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center p-8">
          <p>Loading form...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SendMessage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MessageForm />
    </Suspense>
  );
}
