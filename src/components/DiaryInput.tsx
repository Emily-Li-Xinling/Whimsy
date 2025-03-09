'use client';

import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { checkAndPerformAnalysis } from '@/lib/analysis';

interface ErrorState {
  message: string;
  details: string;
  type: 'error' | 'warning' | 'info';
}

interface InstanceInfo {
  id: string;
  name: string;
  status: string;
  ip: string | null;
}

interface Sentiment {
  score: number;
  magnitude: number;
  label: string;
}

interface Entity {
  name: string;
  type: string;
  salience: number;
}

interface AnalysisResults {
  sentiment: Sentiment;
  topics: string[];
  entities: Entity[];
  summary: string;
}

export default function DiaryInput() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveDiaryEntry = async (content: string) => {
    if (!auth.currentUser) {
      throw new Error('Please login first');
    }
    
    // Save diary entry
    await addDoc(collection(db, 'diaries'), {
      content,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      analyzed: false
    });

    // Check if we have enough entries for batch analysis
    const batchAnalysisPerformed = await checkAndPerformAnalysis(auth.currentUser.uid);
    if (batchAnalysisPerformed) {
      console.log('Batch analysis completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      const result = data.result;
      
      setAnalysisResult(result);

      await saveDiaryEntry(content);

      setContent('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.message || 'Analysis failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {error && (
        <div className={`px-4 py-3 rounded-lg ${
          error === 'error' ? 'bg-red-50 border border-red-200 text-red-600' :
          error === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-600' :
          'bg-blue-50 border border-blue-200 text-blue-600'
        }`}>
          <h4 className="font-medium">{error}</h4>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write down your thoughts..."
          disabled={isLoading}
        />
        
        {showSuccess && (
          <div className="text-green-500 text-sm">Successfully saved!</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className={`w-full py-2 px-4 rounded-lg ${
            isLoading || !content.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Save Entry'}
        </button>
      </form>

      {analysisResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Current Entry Analysis:</h3>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Sentiment:</p>
              <p>Emotion: {analysisResult.sentiment.label}</p>
              <p>Score: {analysisResult.sentiment.score.toFixed(2)}</p>
              <p>Intensity: {analysisResult.sentiment.magnitude.toFixed(2)}</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Topics:</p>
              <p>{analysisResult.topics.join(', ')}</p>
            </div>

            <div className="p-3 border rounded-lg">
              <p className="font-medium">Key Entities:</p>
              <div className="space-y-2">
                {analysisResult.entities.map((entity, index) => (
                  <div key={index}>
                    <p>{entity.name} ({entity.type}) - Importance: {entity.salience.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <p className="font-medium">Summary:</p>
              <p>{analysisResult.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 