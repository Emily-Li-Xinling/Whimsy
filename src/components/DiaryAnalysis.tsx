'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { EmotionAnalysis, TopicAnalysis } from '@/lib/claude';

interface DiaryAnalysisProps {
  diaryId: string;
  emotionAnalysis: EmotionAnalysis;
  topicAnalysis: TopicAnalysis;
}

export default function DiaryAnalysis({ diaryId, emotionAnalysis, topicAnalysis }: DiaryAnalysisProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveAnalysis = async () => {
      try {
        if (!auth.currentUser) {
          setError('Authentication required');
          return;
        }

        // Check if the analysis result already exists
        const q = query(
          collection(db, 'analyses'),
          where('diaryId', '==', diaryId),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // If not exists, save the new analysis result
          await addDoc(collection(db, 'analyses'), {
            diaryId,
            userId: auth.currentUser.uid,
            emotionAnalysis,
            topicAnalysis,
            createdAt: new Date(),
          });
          setSaved(true);
        }
      } catch (error: any) {
        console.error('Save analysis result failed:', error);
        setError(error.message || 'Failed to save analysis');
      }
    };

    saveAnalysis();
  }, [diaryId, emotionAnalysis, topicAnalysis]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Emotion Analysis</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Main Emotion:</span> {emotionAnalysis.emotion}</p>
          <p><span className="font-medium">Intensity:</span> {emotionAnalysis.intensity}/10</p>
          <p><span className="font-medium">Explanation:</span> {emotionAnalysis.explanation}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Topic Analysis</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Main Topic:</span> {topicAnalysis.mainTopic}</p>
          <div>
            <span className="font-medium">Sub Topics:</span>
            <ul className="list-disc list-inside ml-4">
              {topicAnalysis.subTopics.map((topic: string, index: number) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Keywords:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {topicAnalysis.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {saved && (
        <div className="text-sm text-green-600">
          ✓ Analysis result saved
        </div>
      )}
    </div>
  );
} 