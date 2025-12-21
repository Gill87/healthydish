'use client';

import { useRedirectIfAuthenticated } from '@/lib/hooks/useRedirectIfAuthenticated';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Leaf, Sparkles, Heart, Zap, Loader2} from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const { checkingAuth } = useRedirectIfAuthenticated();

  if (checkingAuth) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-12 h-12 accent animate-spin" />
      </div>
    );
  }

  // Prevent landing page flash
  if (checkingAuth) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-12 h-12 accent animate-spin" />
      </div>
    );  
  }

  return (
    <main className="page flex flex-col items-center py-16">
      {/* Header */}
      <header className="w-full max-w-4xl text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border p-3 grid place-items-center accent-soft">
              <Leaf size={28} strokeWidth={1.6} />
            </div>
            <h1>
              <span className="accent">Healthy</span>Dish
            </h1>
          </div>

          <p className="max-w-2xl">
            Your AI-powered companion for delicious, healthy eating
          </p>

          <button className="btn-primary mt-4" onClick={() => router.push('/home')}>
            Get Started
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="w-full max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <article key={f.title} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg accent-soft grid place-items-center">
                {f.icon}
              </div>
              <div>
                <h3>{f.title}</h3>
                <p className="mt-2 text-sm">{f.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Mission */}
      <section className="mt-12 w-full max-w-3xl text-center px-6">
        <h2>Our Mission</h2>
        <p className="mt-4">
          At <span className="accent font-medium">HealthyDish</span>, we believe
          eating healthy shouldn’t mean sacrificing flavor or time.
        </p>
        <p className="mt-4">
          We use AI to generate nutritious, delicious recipes tailored to your goals.
        </p>
        <p className="mt-4">
          Whether you’re eating cleaner, building muscle, or exploring new meals,
          HealthyDish has you covered.
        </p>
      </section>

      {/* Stats */}
      <section className="mt-10 w-full max-w-4xl grid grid-cols-3 gap-6 text-center px-6">
        <Stat value="10k+" label="Recipes" />
        <Stat value="98%" label="Satisfaction" />
        <Stat value="20min" label="Avg Time" />
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold accent">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

const FEATURES = [
  {
    title: 'AI-Generated Recipes',
    text: 'Personalized healthy recipes tailored to your preferences',
    icon: <Sparkles size={18} />,
  },
  {
    title: 'Nutrition Focused',
    text: 'Balanced macros and real nutritional value',
    icon: <Heart size={18} />,
  },
  {
    title: 'Quick & Easy',
    text: 'Meals that fit your schedule, from fast to gourmet',
    icon: <Zap size={18} />,
  },
];
