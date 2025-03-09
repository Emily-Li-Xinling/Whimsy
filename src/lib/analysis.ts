import { collection, query, where, getDocs, addDoc, orderBy, limit, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface DiaryEntry {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
}

interface Entity {
  name: string;
  type: string;
  salience: number;
}

export interface BatchAnalysis {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  diaryIds: string[];
  overallSentiment: {
    averageScore: number;
    dominantLabel: string;
  };
  commonTopics: string[];
  keyEntities: {
    name: string;
    type: string;
    frequency: number;
  }[];
  summary: string;
  createdAt: Date;
}

const BATCH_SIZE = 5;

export async function getUserAnalyses(userId: string): Promise<BatchAnalysis[]> {
  try {
    const analysesRef = collection(db, 'analyses');
    const q = query(
      analysesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate()
    })) as BatchAnalysis[];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}

export async function checkAndPerformAnalysis(userId: string): Promise<boolean> {
  try {
    // Get unanalyzed diaries
    const diariesRef = collection(db, 'diaries');
    const q = query(
      diariesRef,
      where('userId', '==', userId),
      where('analyzed', '!=', true),
      orderBy('createdAt', 'asc'),
      limit(BATCH_SIZE)
    );

    const snapshot = await getDocs(q);
    const diaries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as DiaryEntry[];

    // If we have enough diaries for analysis
    if (diaries.length >= BATCH_SIZE) {
      // Combine all diary content
      const combinedContent = diaries.map(d => d.content).join('\n\n');
      
      // Perform analysis
      const response = await fetch('/api/nlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const { result } = await response.json();

      // Create analysis record
      const analysis: Omit<BatchAnalysis, 'id'> = {
        userId,
        startDate: diaries[0].createdAt,
        endDate: diaries[diaries.length - 1].createdAt,
        diaryIds: diaries.map(d => d.id),
        overallSentiment: {
          averageScore: result.sentiment.score,
          dominantLabel: result.sentiment.label
        },
        commonTopics: result.topics,
        keyEntities: result.entities.map((e: Entity) => ({
          name: e.name,
          type: e.type,
          frequency: e.salience
        })),
        summary: result.summary,
        createdAt: new Date()
      };

      // Save analysis to Firestore
      const analysisRef = collection(db, 'analyses');
      await addDoc(analysisRef, analysis);

      // Mark diaries as analyzed
      const batch = writeBatch(db);
      diaries.forEach(diary => {
        const diaryRef = doc(db, 'diaries', diary.id);
        batch.update(diaryRef, { analyzed: true });
      });
      await batch.commit();

      return true;
    }

    return false;
  } catch (error) {
    console.error('Analysis error:', error);
    return false;
  }
} 