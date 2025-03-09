'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getUserAnalyses, BatchAnalysis } from '@/lib/analysis';
import { format } from 'date-fns';

export default function AnalysisList() {
  const [analyses, setAnalyses] = useState<BatchAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        if (!auth.currentUser) {
          setError('Please login to view analyses');
          return;
        }

        const userAnalyses = await getUserAnalyses(auth.currentUser.uid);
        setAnalyses(userAnalyses);
      } catch (err) {
        console.error('Failed to load analyses:', err);
        setError('Failed to load analyses');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-lg">
          <p>No analyses available yet. Write at least 5 diary entries to generate an analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Diary Analysis History</h2>
      
      {analyses.map((analysis) => (
        <div key={analysis.id} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Analysis Period</h3>
              <p className="text-gray-600">
                {format(analysis.startDate, 'MMM d, yyyy')} - {format(analysis.endDate, 'MMM d, yyyy')}
              </p>
            </div>
            <span className="text-sm text-gray-500">
              Generated on {format(analysis.createdAt, 'MMM d, yyyy')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Overall Sentiment</h4>
              <p className="text-lg">
                {analysis.overallSentiment.dominantLabel}
                <span className="text-sm text-gray-500 ml-2">
                  (Score: {analysis.overallSentiment.averageScore.toFixed(2)})
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Common Topics</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.commonTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <h4 className="font-medium">Key Entities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {analysis.keyEntities.map((entity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({entity.type})</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {(entity.frequency * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Summary</h4>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 