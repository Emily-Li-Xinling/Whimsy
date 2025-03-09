import { NextResponse } from 'next/server';

// Initialize error state
let initError: string | null = null;

async function analyzeText(text: string) {
  const apiKey = process.env.LAMBDA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing LAMBDA_API_KEY environment variable');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a text analysis assistant. Analyze the provided text and return ONLY a JSON object (no markdown formatting, no backticks) in this exact format:
{
  "sentiment": {
    "score": number,
    "magnitude": number,
    "label": string
  },
  "topics": string[],
  "entities": [
    {
      "name": string,
      "type": string,
      "salience": number
    }
  ],
  "summary": string
}`
        },
        {
          role: "user",
          content: `Analyze this text and return ONLY the JSON result with no additional formatting or explanation: ${text}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText
    });
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  try {
    // Get the raw content
    const content = data.choices[0].message.content;
    
    // Remove any markdown formatting if present
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Parse the JSON
    const result = JSON.parse(jsonStr);
    
    // Validate the response format
    if (!result.sentiment || !result.topics || !result.entities || !result.summary) {
      throw new Error('Response missing required fields');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse assistant response:', error);
    console.error('Raw response:', data.choices[0].message.content);
    throw new Error('Invalid response format from assistant');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text is required' },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeText(text);

    return NextResponse.json({
      result: analysisResult
    });

  } catch (error: any) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal Server Error',
        details: error.details || error.stack
      },
      { status: 500 }
    );
  }
}

