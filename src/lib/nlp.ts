export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  explanation: string;
}

export interface TopicAnalysis {
  mainTopic: string;
  subTopics: string[];
  keywords: string[];
}

export interface Sentiment {
  score: number;
  magnitude: number;
  label: string;
}

export interface Entity {
  name: string;
  type: string;
  salience: number;
}

export interface AnalysisResult {
  sentiment: Sentiment;
  entities: Entity[];
  topics: string[];
}

// Convert Google Cloud sentiment score to emotion label
function scoreToEmotion(score: number): string {
  if (score >= 0.5) return 'Positive';
  if (score <= -0.5) return 'Negative';
  return 'Neutral';
}

// Convert Google Cloud sentiment score to intensity
function scoreToIntensity(score: number, magnitude: number): number {
  // Combine score and magnitude to get intensity value (1-10)
  return Math.round((Math.abs(score) * 5 + Math.min(magnitude, 2) * 2.5));
}

async function makeNLPRequest(text: string) {
  try {
    console.log('Making Google Cloud NLP API request...');
    console.log('Request payload:', { text });

    const response = await fetch('/api/nlp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error('Google Cloud NLP API request failed:', error);
    throw error;
  }
}

export async function analyzeEmotion(text: string): Promise<Sentiment> {
  const response = await fetch('/api/nlp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Emotion analysis failed');
  }

  const data = await response.json();
  return data.result.sentiment;
}

export async function analyzeEntities(text: string): Promise<Entity[]> {
  const response = await fetch('/api/nlp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Entity analysis failed');
  }

  const data = await response.json();
  return data.result.entities;
}

export async function analyzeTopics(text: string): Promise<string[]> {
  const response = await fetch('/api/nlp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Topic analysis failed');
  }

  const data = await response.json();
  return data.result.topics;
}

export async function testNLPAPI(): Promise<boolean> {
  try {
    console.log('Testing Google Cloud NLP API connection...');
    
    const response = await fetch('/api/nlp');
    const data = await response.json();
    
    console.log('Test response:', JSON.stringify(data, null, 2));
    return data.success === true;
  } catch (error: any) {
    console.error('Google Cloud NLP API test failed:', error);
    return false;
  }
} 