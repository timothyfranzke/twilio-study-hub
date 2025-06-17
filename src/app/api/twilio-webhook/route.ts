import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { URLSearchParams } from 'url';

// Validate that the request is coming from Twilio
const validateRequest = (request: NextRequest, twilioAuthToken: string): boolean => {
  // In a production environment, you should validate the request signature
  // This is a simplified version for development
  return true;
};

export async function POST(request: NextRequest) {
  try {
    // Get Twilio auth token from environment variables
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
    
    // Validate that the request is coming from Twilio
    if (!validateRequest(request, twilioAuthToken)) {
      return NextResponse.json({ error: 'Invalid request signature' }, { status: 403 });
    }
    
    // Parse the incoming form data
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    
    // Extract the message body from the Twilio request
    const incomingMessage = body.Body?.toString() || '';
    const from = body.From?.toString() || '';
    
    console.log(`Received message: "${incomingMessage}" from ${from}`);
    
    // Generate a session ID (you might want to use a more sophisticated method)
    const sessionId = Math.random().toString(36).substring(2, 10);
    
    // Create a URL with the session information
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      session: sessionId,
      from: from,
      message: incomingMessage
    });
    
    const studyUrl = `${baseUrl}/hello?${params.toString()}`;
    
    // Create a TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Here's your study session link: ${studyUrl}`);
    
    // Return the TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
