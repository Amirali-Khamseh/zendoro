import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  type Variants,
} from "motion/react";
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
import { DottedSurface } from "@/components/ui/dotted-surface";
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
      "An agentic assistant that can look up your real tasks, habits, and reminders, and take action on them for you.",
  },
  {
    icon: UserCircle,
    title: "Profile & Account",
    accent: "text-rose-400",
    description:
      "Manage your profile picture and account details, with full control to delete your data at any time.",
  },
];

const showcaseItems = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Focus sessions, tasks, reminders, and habit completion, plus a goal-in-focus card and charts, all on one screen.",
    image: "/images/landing/dashboard.png",
    alt: "Zendoro dashboard showing stat cards, a goal card, charts, and an upcoming task list",
  },
  {
    icon: Timer,
    title: "Focus Timer",
    description:
      "Standard, Extended, or Long run mode, with fully adjustable focus and break durations. Every session rolls up into your dashboard.",
    image: "/images/landing/focus.png",
    alt: "Zendoro Focus Time page with a Long run timer and session counter",
  },
  {
    icon: Target,
    title: "Habit Tracker",
    description:
      "Check habits off across a Monday-to-Sunday grid, with a completion rate calculated automatically for each one.",
    image: "/images/landing/habits.png",
    alt: "Zendoro Habit Tracker page with a weekly completion grid for five habits",
  },
  {
    icon: CheckSquare,
    title: "Task Board",
    description:
      "A drag-and-drop Kanban board with TODO, In Progress, Done, and Kill columns for every task.",
    image: "/images/landing/todo.png",
    alt: "Zendoro TODOs page with a four column Kanban board",
  },
  {
    icon: Bell,
    title: "Reminders",
    description:
      "A calendar of upcoming, completed, and overdue reminders, with priorities and due dates that can link to a task.",
    image: "/images/landing/reminders.png",
    alt: "Zendoro Reminder page with a monthly calendar and a reminder list",
  },
  {
    icon: Trophy,
    title: "Goals",
    description:
      "Tie tasks, habits, and reminders to a single goal and watch overall progress calculate itself.",
    image: "/images/landing/goals.png",
    alt: "Zendoro Goals page listing goals with progress bars",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "An agentic assistant: it can query your real tasks, habits, and reminders, and it can act on them for you, like creating a reminder or rescheduling a task, not just answer questions about them.",
    image: "/images/landing/ai-assistant.png",
    alt: "Zendoro AI Assistant chat answering a question about the user's tasks",
  },
  {
    icon: UserCircle,
    title: "Profile & Account",
    description:
      "Manage your profile picture and account details, with full control to delete your data at any time.",
    image: "/images/landing/profile.png",
    alt: "Zendoro Profile page with account information and a danger zone",
  },
];

const faqs = [
  {
    q: "What is Zendoro?",
    a: "Zendoro (Zen + Pomodoro) is a productivity app that combines a Pomodoro-style focus timer with a habit tracker, a calendar and reminder system, a goal tracker, and an AI assistant, all under one dashboard.",
  },
  {
    q: "How does the AI assistant know about my tasks and habits?",
    a: "It's agentic. It can call functions like \"get my tasks due this week\" or \"get my habit completion this month\" to read your real data, and it can also take action on your behalf, like creating a reminder or updating a task, instead of just answering questions.",
  },
  {
    q: "Can I link my tasks, habits, and reminders together?",
    a: "Yes. Goals let you attach existing tasks, habits, and reminders to one target, and Zendoro calculates the overall progress percentage for you automatically.",
  },
  {
    q: "What happens if I complete all the reminders linked to a task?",
    a: "The task is automatically marked as done, so reminders and tasks stay in sync without extra clicks.",
  },
  {
    q: "Is creating an account free?",
    a: "Yes, signing up just requires a name, email, and password, verified with a 6-digit emailed code before your account goes live.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => motionValue.on("change", (v) => setDisplay(Math.round(v))), [motionValue]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [inView, value, motionValue]);

  return <span ref={ref}>{display}</span>;
}

function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Zendoro" className="h-6 brightness-0 invert" />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:inline-block">
            <GradientButton size="default" asChild>
              <Link to="/signup">Get Started</Link>
            </GradientButton>
          </motion.div>
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

      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 uppercase"
        >
          Focus · Habits · Goals · AI in one workspace
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="mt-6 font-beba text-5xl leading-none text-white sm:text-6xl md:text-7xl"
        >
          Stay focused. Build habits.
          <br />
          Hit your goals.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-lg"
        >
          Zendoro combines a Pomodoro focus timer, habit tracker, task board,
          reminders, goals, and an agentic AI assistant that can act on your
          data, all in a single calm dashboard.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <GradientButton size="default" className="w-full sm:w-auto" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </GradientButton>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              asChild
            >
              <Link to="/login">Log In</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mx-auto mt-14 max-w-6xl"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-sm md:p-3">
          <div
            className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 blur-xl"
            aria-hidden="true"
          />
          <img
            src="/images/landing/dashboard.png"
            alt="Zendoro dashboard showing focus sessions, tasks, reminders, and habit stats"
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      </motion.div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { label: "Core modules", value: 6 },
    { label: "Timer modes", value: 3 },
    { label: "Task columns", value: 4 },
    { label: "Dashboard for everything", value: 1 },
  ];
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-4 py-10 md:px-6">
      <motion.div
        className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center md:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <div className="font-beba text-4xl text-white md:text-5xl">
              <Counter value={s.value} />
            </div>
            <div className="mt-1 text-xs text-white/60 md:text-sm">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section id="features" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="font-beba text-4xl text-white md:text-5xl">
            Everything you need to stay in the zone
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-white/70">
            Every tool a focused, goal-driven day actually needs, with nothing
            you have to bolt on separately.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const AI_ASSISTANT_INDEX = showcaseItems.findIndex(
  (item) => item.title === "AI Assistant",
);

function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const current = showcaseItems[active];

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#ai-assistant" && AI_ASSISTANT_INDEX !== -1) {
        setActive(AI_ASSISTANT_INDEX);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <section id="ai-assistant" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="font-beba text-4xl text-white md:text-5xl">
            Every feature, one workspace
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-white/70">
            Pick a screen to see what it actually looks like.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {showcaseItems.map((item, i) => (
              <motion.button
                key={item.title}
                type="button"
                onClick={() => setActive(i)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`flex shrink-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors lg:shrink lg:w-full ${
                  i === active
                    ? "border-white/20 bg-white/10"
                    : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                }`}
              >
                <item.icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${i === active ? "text-white" : "text-white/50"}`}
                />
                <span className="min-w-[10rem] lg:min-w-0">
                  <span
                    className={`block text-sm font-semibold whitespace-nowrap lg:whitespace-normal ${i === active ? "text-white" : "text-white/80"}`}
                  >
                    {item.title}
                  </span>
                  <span className="hidden text-xs text-white/50 lg:mt-0.5 lg:block">
                    {item.description}
                  </span>
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:h-[440px] md:p-6 lg:h-[520px]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={current.image}
                src={current.image}
                alt={current.alt}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="max-h-full max-w-full rounded-xl border border-white/10 object-contain"
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="px-4 py-20 md:px-6 md:py-28">
      <motion.div
        className="mx-auto max-w-3xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeUp}
          className="text-center font-beba text-4xl text-white md:text-5xl"
        >
          Frequently asked questions
        </motion.h2>
        <motion.div variants={fadeUp}>
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
        </motion.div>
      </motion.div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <motion.div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 text-center md:p-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(120,60,180,0.25),rgba(0,0,0,0))]"
          aria-hidden="true"
        />
        <motion.h2 variants={fadeUp} className="font-beba text-4xl text-white md:text-5xl">
          Ready to get in the zone?
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-white/70">
          Create your free account and bring your focus timer, habits, tasks,
          reminders, and goals into one place.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <GradientButton size="default" className="w-full sm:w-auto" asChild>
              <Link to="/signup">
                Create your free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </GradientButton>
          </motion.div>
        </motion.div>
      </motion.div>
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
  useDocumentTitle("Zendoro: Focus, Habits, Goals & AI in one place");

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#00091d] font-roboto text-white">
      <DottedSurface className="fixed inset-0 -z-10" />
      <NavBar />
      <Hero />
      <StatsStrip />
      <FeatureGrid />
      <FeatureShowcase />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
