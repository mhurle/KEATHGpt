// chat-proxy/index.ts
import { serve } from "https://deno.land/std@0.157.0/http/server.ts";

// Add proper type for the request body
interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model: string;
  stream: boolean;
}

serve(async (req) => {
  try {
    const { messages, model, stream } = await req.json() as ChatRequest;
    
    // Process the chat request and return response
    return new Response(
      JSON.stringify({ 
        message: `Received message: ${messages[0].content}` 
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});