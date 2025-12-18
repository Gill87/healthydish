import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
import { Heart } from 'lucide-react';

type PopularRow = {
  id: string;
  title: string;
  description?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  servings?: number | null;
  difficulty?: string | null;
  ingredients?: any;
  instructions?: any;
  tips?: any;
  created_at?: string | null;
};

export default async function PopularRecipesPage() {
  const { data, error } = await supabase
    .from('popular_recipes')
    .select('id, title, description, prep_time, cook_time, servings, difficulty, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const rows: PopularRow[] = data ?? [];

  return (
    <div className="page">
      <main className="container space-y-6 py-8">
        <h2 className="mb-4">Trending Right Now</h2>

        {rows.length === 0 ? (
          <p className="text-muted">No trending recipes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => (
              <Link key={r.id} href={`/popular-recipes/${r.id}`}>
                <div className="card p-4 h-full flex flex-col justify-between cursor-pointer">
                  <div>
                    <h3 className="line-clamp-2">{r.title}</h3>
                    {r.description && (
                      <p className="text-sm mt-2 line-clamp-3">{r.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted">
                      {r.prep_time || '15 min'} prep + {r.cook_time || '30 min'} cook
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
