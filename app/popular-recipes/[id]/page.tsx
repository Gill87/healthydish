import supabase from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

type PopularRow = {
  id: string;
  title: string;
  description?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  servings?: number | null;
  difficulty?: string | null;
  ingredients?: any[];
  instructions?: any[];
  tips?: any[];
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) return notFound();

  const { data, error } = await supabase
    .from('popular_recipes')
    .select(`
      id,
      title,
      description,
      prep_time,
      cook_time,
      servings,
      difficulty,
      ingredients,
      instructions,
      tips
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error("DETAIL PAGE ERROR:", error);
    return notFound();
  }

  if (!data) return notFound();

  const r: PopularRow = data;

  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  const instructions = Array.isArray(r.instructions) ? r.instructions : [];
  const tips = Array.isArray(r.tips) ? r.tips : [];

  return (
    <div className="page">
      <main className="container py-8">
        <div className="card p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="flex-1">{r.title}</h1>
          </div>

          {r.description && <p className="mt-2">{r.description}</p>}

          <div className="flex gap-6 mt-4 text-sm text-muted">
            <span>{r.prep_time || '15 min'} prep + {r.cook_time || '30 min'} cook</span>
            <span>{r.servings ?? 4} servings</span>
            <span>{r.difficulty ?? 'Medium'}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1 card p-6">
              <h3 className="mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {ingredients.map((i, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full accent mt-2" />
                    <span>
                      <strong>{i.amount}</strong> {i.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 card p-6">
              <h3 className="mb-4">Instructions</h3>
              <ol className="space-y-4">
                {instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full accent-soft flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <p>{String(step)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {tips.length > 0 && (
            <div className="card p-6 mt-6">
              <h3 className="mb-3">Chef's Tips</h3>
              <ul className="space-y-2">
                {tips.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="accent font-bold">•</span>
                    <span>{String(t)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}