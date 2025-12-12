'use client';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { Leaf, Sparkles, Heart, Zap, ArrowRight } from 'lucide-react'

export default function Page() {
  const router = useRouter();
  function handleGetStarted(){
    router.push('/signin');
  }
  return (
    <main className="min-h-screen bg-emerald-50 text-emerald-900 flex flex-col items-center py-16 px-6">
      <header className="z-10 w-full max-w-4xl text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border-2 border-emerald-200 p-3 grid place-items-center">
              {/* lucide leaf icon */}
              <Leaf size={28} strokeWidth={1.6} className="text-emerald-700" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="text-emerald-600">Healthy</span>
              <span className="text-emerald-900">Dish</span>
            </h1>
          </div>

          <p className="max-w-2xl text-emerald-800/80">Your AI-powered companion for delicious, healthy eating</p>

          <button className="mt-6 inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
          onClick={handleGetStarted}>
            Get Started
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="z-10 w-full max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <article key={f.title} className="bg-white/90 rounded-xl p-6 shadow-md border border-emerald-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-50 grid place-items-center">
                <span aria-hidden className="text-emerald-700">{f.icon}</span>
              </div>
              <div className="text-sm">
                <h3 className="font-semibold text-emerald-900">{f.title}</h3>
                <p className="text-emerald-800/80 mt-2 text-xs">{f.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Mission */}
      <section className="z-10 mt-12 w-full max-w-3xl text-center px-6">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="mt-4 text-emerald-800/80 leading-relaxed">
          At <span className="font-medium text-emerald-700">HealthyDish</span>, we believe that eating healthy shouldn't mean sacrificing flavor or spending hours in the kitchen.
        </p>
        <p className="mt-4 text-emerald-800/80 leading-relaxed">
          We harness the power of AI to generate delicious, nutritious recipes that help you achieve your health goals while enjoying every bite.
        </p>
        <p className="mt-4 text-emerald-800/80 leading-relaxed">
          Whether you're looking to eat cleaner, build muscle, or simply discover new healthy favorites, HealthyDish is here to guide your culinary journey.
        </p>
      </section>

      {/* Stats */}
      <section className="z-10 mt-10 w-full max-w-4xl grid grid-cols-3 gap-6 text-center px-6">
        <Stat value="10k+" label="Recipes" />
        <Stat value="98%" label="Satisfaction" />
        <Stat value="5min" label="Avg Time" />
      </section>

    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-transparent">
      <div className="text-2xl font-semibold text-emerald-700">{value}</div>
      <div className="mt-1 text-sm text-emerald-800/70">{label}</div>
    </div>
  )
}

const FEATURES = [
  {
    title: 'AI-Generated Recipes',
    text: 'Get personalized healthy recipes tailored to your preferences and dietary needs',
    icon: <Sparkles size={18} strokeWidth={1.8} />,
  },
  {
    title: 'Nutrition Focused',
    text: 'Every recipe is optimized for balanced macros and nutritional value',
    icon: <Heart size={18} strokeWidth={1.8} />,
  },
  {
    title: 'Quick & Easy',
    text: "From fast meals to gourmet dishes, find recipes that fit your schedule",
    icon: <Zap size={18} strokeWidth={1.8} />,
  },
]
