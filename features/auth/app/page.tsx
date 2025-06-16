"use client";
import { Button } from "@/components/ui/button";
import { RocketIcon, PaletteIcon, ShieldCheckIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoginButton } from "@/app/components/auth/login-button";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full text-foreground relative overflow-hidden px-6 py-20 flex flex-col items-center justify-center">
      {/* Animated gradient blobs */}
      <div className="absolute top-0 -left-20 w-[400px] h-[400px] glass-gradient-blob animate-blob" />
      <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] glass-gradient-blob animate-blob2" />

      <div className="relative z-10 max-w-5xl w-full space-y-10">
        <div className="flex justify-between">
          <div /> <ThemeToggle />
        </div>

        <section className="text-center space-y-6 backdrop-blur-xl bg-card/70 border border-border rounded-3xl p-10 shadow-xl animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 text-transparent bg-clip-text animate-text-fade">
            StackPilot
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Scaffold modern, production-ready Next.js apps in seconds. AI-inspired gradients, theming, payments, deployments — all customizable via CLI.
          </p>
          <div className="flex justify-center flex-wrap gap-4 pt-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">GitHub Repo</Button>
          </div>
          <LoginButton mode="redirect">
            <Button size="lg">Login</Button>
          </LoginButton>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={<ShieldCheckIcon />} title="Production Auth" desc="Email, Google, GitHub auth out of the box. NextAuth + secure flows + hooks." />
          <FeatureCard icon={<RocketIcon />} title="Payments Ready" desc="Stripe & Razorpay for subscriptions or one-time — integrated with context." />
          <FeatureCard icon={<PaletteIcon />} title="Theming Built-in" desc="Dark/light mode, Tailwind v4 tokens, color picker from the CLI." />
        </section>
      </div>

      <style jsx>{`
        .glass-gradient-blob {
          background: radial-gradient(circle at top left, rgba(131, 58, 180, 0.6), transparent 70%);
          filter: blur(150px);
        }
        .animate-blob { animation: blob 8s infinite; }
        .animate-blob2 { animation: blob 10s infinite reverse; }

        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        @keyframes text-fade {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        .animate-text-fade {
          animation: text-fade 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 backdrop-blur-md bg-card/60 border border-muted rounded-2xl shadow-sm hover:shadow-lg transition-all animate-slide-up">
      <div className="flex items-center gap-3 mb-3 text-primary">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}
