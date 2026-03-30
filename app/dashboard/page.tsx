'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export default function Dashboard() {
  const supabase = createClient<Database>();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load groups where user is either learner or teacher
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .or(`learner_id.eq.${user.id},teacher_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
      } catch (error) {
        console.error('Failed to load groups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Learning Groups</h1>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No learning groups yet</p>
          <a
            href="/dashboard/groups/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create a Group
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.group_id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {group.base_language} ↔ {group.target_language}
              </h2>
              <p className="text-gray-600 mb-4">
                Level: <span className="font-medium">{group.difficulty_level}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Status: <span className="font-medium">{group.status}</span>
              </p>
              <a
                href={`/dashboard/groups/${group.group_id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Progress →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
