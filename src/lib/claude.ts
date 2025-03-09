import Anthropic from '@anthropic-ai/sdk';

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
  
  async function makeClaudeRequest(messages: any) {
    try {
      console.log('Making Claude API request...');
      console.log('Request payload:', { messages });

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data, null, 2));

      // Claude-2.1 的响应格式略有不同
      if (!data.content) {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid response format from Claude API');
      }

      try {
        // Claude-2.1 直接返回文本响应
        const jsonResponse = JSON.parse(data.content);
        console.log('Parsed JSON response:', jsonResponse);
        return jsonResponse;
      } catch (e) {
        console.error('Failed to parse API response as JSON:', {
          text: data.content,
          error: e
        });
        throw new Error('Invalid JSON response from Claude API');
      }
    } catch (error: any) {
      console.error('Claude API request failed:', error);
      throw error;
    }
  }
  
  export async function analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      console.log('Starting emotion analysis...');
      if (!text.trim()) {
        throw new Error('Text cannot be empty');
      }
  
      const result = await makeClaudeRequest([{
        role: 'user',
        content: `Analyze this text and return a JSON object with emotion (string), intensity (number 1-10), and explanation (string): "${text}"`
      }]);
  
      // Validate result structure
      if (!result.emotion || typeof result.intensity !== 'number' || !result.explanation) {
        console.error('Invalid emotion analysis result structure:', result);
        throw new Error('Invalid analysis result format');
      }
  
      console.log('Emotion analysis completed successfully');
      return result;
    } catch (error: any) {
      console.error('Emotion analysis failed:', error);
      return {
        emotion: 'Unknown',
        intensity: 0,
        explanation: `Analysis failed: ${error.message}`
      };
    }
  }
  
  export async function analyzeTopics(text: string): Promise<TopicAnalysis> {
    try {
      console.log('Starting topic analysis...');
      if (!text.trim()) {
        throw new Error('Text cannot be empty');
      }
  
      const result = await makeClaudeRequest([{
        role: 'user',
        content: `Analyze this text and return a JSON object with mainTopic (string), subTopics (string array), and keywords (string array): "${text}"`
      }]);
  
      // Validate result structure
      if (!result.mainTopic || !Array.isArray(result.subTopics) || !Array.isArray(result.keywords)) {
        console.error('Invalid topic analysis result structure:', result);
        throw new Error('Invalid analysis result format');
      }
  
      console.log('Topic analysis completed successfully');
      return result;
    } catch (error: any) {
      console.error('Topic analysis failed:', error);
      return {
        mainTopic: 'Unknown',
        subTopics: [],
        keywords: [`Analysis failed: ${error.message}`]
      };
    }
  }
  
  // Test the API key
  export async function testClaudeAPI(): Promise<boolean> {
    try {
      console.log('Testing Claude API connection...');
      
      const response = await fetch('/api/claude');
      const data = await response.json();
      
      console.log('Test response:', JSON.stringify(data, null, 2));
      return data.success === true;
    } catch (error: any) {
      console.error('Claude API test failed:', error);
      return false;
    }
  }
  