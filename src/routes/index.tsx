import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Timer,
  Activity,
  Target,
  CheckSquare,
  Bell,
  Trophy,
  Bot,
  LayoutDashboard,
  UserCircle,
  ArrowRight,
  Github,
} from "lucide-react";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";

export const Route = createFileRoute("/")({
  component: LandingPage,
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    accent: "text-sky-400",
    description:
      "One overview of focus sessions, tasks, reminders, and habit completion, updated in real time.",
  },
  {
    icon: Timer,
    title: "Focus Timer",
    accent: "text-sky-400",
    description:
      "A Pomodoro-style timer with Standard, Extended, and Long run modes, each with fully adjustable focus and break durations.",
  },
  {
    icon: Activity,
    title: "Daily Activity",
    accent: "text-orange-400",
    description:
      "Log steps, heart rate, workouts, distance, calories, and sleep, plus any custom metric you want to track.",
  },
  {
    icon: Target,
    title: "Habit Tracker",
    accent: "text-fuchsia-400",
    description:
      "Build habits and check them off across a Monday-to-Sunday grid, with an automatically calculated completion rate.",
  },
  {
    icon: CheckSquare,
    title: "Task Board",
    accent: "text-emerald-400",
    description:
      "A drag-and-drop Kanban board with TODO, In Progress, Done, and Kill columns for every task.",
  },
  {
    icon: Bell,
    title: "Reminders",
    accent: "text-amber-400",
    description:
      "Calendar-based reminders with priorities and due dates that can link to a task and auto-complete it.",
  },
  {
    icon: Trophy,
    title: "Goals",
    accent: "text-yellow-400",
    description:
      "Tie tasks, habits, and reminders to a single goal and watch overall progress calculate itself.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    accent: "text-violet-400",
    description:
      "Ask questions about your own tasks, habits, and reminders and get answers grounded in your real data.",
  },
  {
    icon: UserCircle,
    title: "Profile & Account",
    accent: "text-rose-400",
    description:
      "Manage your profile picture and account details, with full control to delete your data at any time.",
  },
];

const spotlights = [
  {
    title: "See everything at a glance",
    description:
      "The dashboard pulls together focus sessions completed today, tasks done versus total with an overdue count, reminders due today, and your average habit completion rate — plus a goal-in-focus card, a task status chart, a weekly habit chart, and an upcoming agenda.",
    image: "/images/7.png",
    alt: "Zendoro dashboard showing stat cards, a goal card, charts, and an upcoming task list",
  },
  {
    title: "Work in focused bursts",
    description:
      "Pick Standard, Extended, or Long run mode, fine-tune your focus, short break, and long break durations, then start the timer. Every completed session is counted and rolled up into your dashboard.",
    image: "/images/1.png",
    alt: "Zendoro Focus Time page with a Long run timer and session counter",
  },
  {
    title: "Ask your own data a question",
    description:
      "The AI assistant is built on Gemini function calling: it decides which of your real tasks, habits, or reminders to query, then writes an answer grounded in that data — formatted as Markdown, not a guess.",
    image: "/images/6.png",
    alt: "Zendoro AI Assistant chat answering a question about the user's tasks",
  },
];

const faqs = [
  {
    q: "What is Zendoro?",
    a: "Zendoro (Zen + Pomodoro) is a productivity app that combines a Pomodoro-style focus timer with a habit tracker, a calendar and reminder system, a goal tracker, and an AI assistant — all under one dashboard.",
  },
  {
    q: "How does the AI assistant know about my tasks and habits?",
    a: "It uses Gemini's function calling: the model can call functions like \"get my tasks due this week\" or \"get my habit completion this month\", get the real result back from your account, and use that to write its answer.",
  },
  {
    q: "Can I link my tasks, habits, and reminders together?",
    a: "Yes. Goals let you attach existing tasks, habits, and reminders to one target, and Zendoro calculates the overall progress percentage for you automatically.",
  },
  {
    q: "What happens if I complete all the reminders linked to a task?",
    a: "The task is automatically marked as done — reminders and tasks stay in sync without extra clicks.",
  },
  {
    q: "Is creating an account free?",
    a: "Yes, signing up just requires a name, email, and password — verified with a 6-digit emailed code before your account goes live.",
  },
];

function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Zendoro" className="h-6 brightness-0 invert" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#ai-assistant" className="transition-colors hover:text-white">
            AI Assistant
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <GradientButton size="default" className="hidden md:inline-flex" asChild>
            <Link to="/signup">Get Started</Link>
          </GradientButton>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 md:px-6 md:pt-24 md:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,60,180,0.25),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 uppercase">
          Focus · Habits · Goals · AI — one workspace
        </span>

        <h1 className="mt-6 font-beba text-5xl leading-none text-white sm:text-6xl md:text-7xl">
          Stay focused. Build habits.
          <br />
          Hit your goals.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-lg">
          Zendoro combines a Pomodoro focus timer, habit tracker, task board,
          reminders, goals, and an AI assistant that actually knows your data
          — into a single calm dashboard.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GradientButton size="default" className="w-full sm:w-auto" asChild>
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </GradientButton>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            asChild
          >
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-5xl">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-sm md:p-3">
          <div
            className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 blur-xl"
            aria-hidden="true"
          />
          <img
            src="/images/7.png"
            alt="Zendoro dashboard showing focus sessions, tasks, reminders, and habit stats"
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { label: "Core modules", value: "6" },
    { label: "Timer modes", value: "3" },
    { label: "Task columns", value: "4" },
    { label: "Dashboard for everything", value: "1" },
  ];
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-4 py-10 md:px-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-beba text-4xl text-white md:text-5xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-white/60 md:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section id="features" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-beba text-4xl text-white md:text-5xl">
            Everything you need to stay in the zone
          </h2>
          <p className="mt-4 text-white/70">
            Every tool a focused, goal-driven day actually needs — nothing you
            have to bolt on separately.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/[0.07]"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 ${f.accent}`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Spotlight({
  title,
  description,
  image,
  alt,
  reverse,
  anchorId,
}: {
  title: string;
  description: string;
  image: string;
  alt: string;
  reverse?: boolean;
  anchorId?: string;
}) {
  return (
    <section id={anchorId} className="px-4 py-14 md:px-6 md:py-20">
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center gap-10 md:gap-16 lg:flex-row ${
          reverse ? "lg:flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl">
            <img
              src={image}
              alt={alt}
              className="w-full rounded-xl border border-white/10"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-beba text-3xl text-white md:text-4xl">
            {title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-beba text-4xl text-white md:text-5xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-white/10"
            >
              <AccordionTrigger className="text-left text-white hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/60">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 text-center md:p-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(120,60,180,0.25),rgba(0,0,0,0))]"
          aria-hidden="true"
        />
        <h2 className="font-beba text-4xl text-white md:text-5xl">
          Ready to get in the zone?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Create your free account and bring your focus timer, habits, tasks,
          reminders, and goals into one place.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GradientButton size="default" className="w-full sm:w-auto" asChild>
            <Link to="/signup">
              Create your free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </GradientButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Zendoro" className="h-5 brightness-0 invert opacity-80" />
        </div>
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} Zendoro. Built with the Pomodoro
          technique in mind.
        </p>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <Link to="/login" className="hover:text-white">
            Log In
          </Link>
          <Link to="/signup" className="hover:text-white">
            Sign Up
          </Link>
          <a
            href="https://github.com/Amirali-Khamseh/zendoro-backend"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-white"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  useDocumentTitle("Zendoro — Focus, Habits, Goals & AI in one place");

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] font-roboto text-white">
      <NavBar />
      <Hero />
      <StatsStrip />
      <FeatureGrid />
      {spotlights.map((s, i) => (
        <Spotlight
          key={s.title}
          title={s.title}
          description={s.description}
          image={s.image}
          alt={s.alt}
          reverse={i % 2 === 1}
          anchorId={i === 2 ? "ai-assistant" : undefined}
        />
      ))}
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
