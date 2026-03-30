'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/types';

type Group = Database['public']['Tables']['groups']['Row'];
type Streak = Database['public']['Tables']['streaks']['Row'];
type LearningLoop = Database['public']['Tables']['learning_loops']['Row'];

export default function GroupDetail() {
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClientComponentClient<Database>();

  const [group, setGroup] = useState<Group | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loops, setLoops] = useState<LearningLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        // Load group
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // Load streak
        const { data: streakData } = await supabase
          .from('streaks')
          .select('*')
          .eq('group_id', groupId)
          .single();

        if (streakData) setStreak(streakData);

        // Load recent learning loops
        const { data: loopsData } = await supabase
          .from('learning_loops')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (loopsData) setLoops(loopsData);
      } catch (error) {
        console.error('Failed to load group data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'learning_loops', filter: `group_id=eq.${groupId}` },
        (payload) => {
          console.log('Learning loop updated:', payload);
          // Reload loops
          loadGroupData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Group not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{group.target_language} Learning</h1>
      <p className="text-gray-600 mb-8">Base: {group.base_language}</p>

      {/* Streak Card */}
      {streak && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">{streak.current_streak}</div>
              <div className="text-sm opacity-90">Current Streak</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{streak.longest_streak}</div>
              <div className="text-sm opacity-90">Longest Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Date(streak.last_completed_date || '').toLocaleDateString()}
              </div>
              <div className="text-sm opacity-90">Last Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Learning Loops */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Learning Loops</h2>

        {loops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No learning loops yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loops.map((loop) => (
              <div key={loop.loop_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-lg">Loop {loop.loop_id.slice(0, 8)}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      loop.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : loop.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {loop.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Created: {new Date(loop.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${getLoopProgress(loop.status)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getLoopProgress(status: string): number {
  const progressMap: Record<string, number> = {
    pending_sentence: 10,
    awaiting_teacher_reply: 25,
    awaiting_translation: 50,
    evaluating_translation: 60,
    awaiting_learner_reply: 75,
    evaluating_reply: 85,
    completed: 100,
    expired: 0,
  };
  return progressMap[status] || 0;
}
