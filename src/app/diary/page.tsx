'use client';

import DiaryInput from '@/components/DiaryInput';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DiaryPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            My Diary
          </h1>
          <DiaryInput />
        </div>
      </main>
    </ProtectedRoute>
  );
} 