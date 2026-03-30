'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Word {
  word_id: string;
  language: string;
  word_text_roman: string;
  meaning: string;
  part_of_speech: string;
  difficulty_level: string;
  example_sentence: string | null;
}

export default function WordBank() {
  const supabase = createClient();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ level: 'all', pos: 'all', search: '' });

  useEffect(() => {
    const loadWords = async () => {
      try {
        const { data, error } = await supabase
          .from('words')
          .select('*')
          .order('difficulty_level')
          .order('part_of_speech')
          .order('word_text_roman');

        if (error) throw error;
        setWords(data || []);
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [supabase]);

  const filtered = words.filter((w) => {
    if (filter.level !== 'all' && w.difficulty_level !== filter.level) return false;
    if (filter.pos !== 'all' && w.part_of_speech !== filter.pos) return false;
    if (filter.search && !w.word_text_roman.toLowerCase().includes(filter.search.toLowerCase()) && !w.meaning.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const posColors: Record<string, string> = {
    noun: 'bg-blue-100 text-blue-800',
    verb: 'bg-purple-100 text-purple-800',
    adjective: 'bg-orange-100 text-orange-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading word bank...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tamil Word Bank</h1>
          <p className="text-gray-500 mt-1">{filtered.length} of {words.length} words</p>
        </div>
        <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
          &larr; Dashboard
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search words or meanings..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter.level}
          onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={filter.pos}
          onChange={(e) => setFilter({ ...filter, pos: e.target.value })}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="noun">Nouns</option>
          <option value="verb">Verbs</option>
          <option value="adjective">Adjectives</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Word (Roman)</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Meaning</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Type</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Level</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((word) => (
              <tr key={word.word_id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{word.word_text_roman}</td>
                <td className="px-6 py-3 text-gray-700">{word.meaning}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${posColors[word.part_of_speech] || ''}`}>
                    {word.part_of_speech}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${levelColors[word.difficulty_level] || ''}`}>
                    {word.difficulty_level}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 italic max-w-xs truncate">
                  {word.example_sentence || '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No words match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
