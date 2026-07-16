import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Activity, CalendarDays, Footprints, HeartPulse, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";
import { containsDangerousInput } from "@/lib/inputSanitization";
import { useDailyActivityStore } from "@/zustand/dailyActivityStore";

export const Route = createFileRoute("/daily-activity")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

type CustomMetricRow = {
  key: string;
  value: string;
};

const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function RouteComponent() {
  useDocumentTitle("Daily Activity");

  const {
    submitDailyActivity,
    isSubmitting,
    submitError,
    lastSavedActivity,
    lastMessage,
    clearSubmitState,
  } = useDailyActivityStore();

  const [date, setDate] = useState(toIsoDate(new Date()));
  const [steps, setSteps] = useState("");
  const [heartRateAvg, setHeartRateAvg] = useState("");
  const [workoutMinutes, setWorkoutMinutes] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [sleepMinutes, setSleepMinutes] = useState("");
  const [customMetrics, setCustomMetrics] = useState<CustomMetricRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasAnyMetric = useMemo(
    () =>
      Boolean(
        steps.trim() ||
          heartRateAvg.trim() ||
          workoutMinutes.trim() ||
          distanceKm.trim() ||
          caloriesBurned.trim() ||
          sleepMinutes.trim() ||
          customMetrics.some((m) => m.key.trim() || m.value.trim()),
      ),
    [
      steps,
      heartRateAvg,
      workoutMinutes,
      distanceKm,
      caloriesBurned,
      sleepMinutes,
      customMetrics,
    ],
  );

  const addCustomMetric = () => {
    setCustomMetrics((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeCustomMetric = (index: number) => {
    setCustomMetrics((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCustomMetric = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setCustomMetrics((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const resetForm = () => {
    setSteps("");
    setHeartRateAvg("");
    setWorkoutMinutes("");
    setDistanceKm("");
    setCaloriesBurned("");
    setSleepMinutes("");
    setCustomMetrics([]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearSubmitState();

    const nextErrors: Record<string, string> = {};

    if (!date) {
      nextErrors.date = "Date is required";
    }

    const parsedSteps = parseOptionalNumber(steps);
    const parsedHeartRate = parseOptionalNumber(heartRateAvg);
    const parsedWorkout = parseOptionalNumber(workoutMinutes);
    const parsedDistance = parseOptionalNumber(distanceKm);
    const parsedCalories = parseOptionalNumber(caloriesBurned);
    const parsedSleep = parseOptionalNumber(sleepMinutes);

    const integerFields: Array<[string, number | undefined]> = [
      ["steps", parsedSteps],
      ["heartRateAvg", parsedHeartRate],
      ["workoutMinutes", parsedWorkout],
      ["caloriesBurned", parsedCalories],
      ["sleepMinutes", parsedSleep],
    ];

    for (const [name, value] of integerFields) {
      if (value === undefined) continue;
      if (!Number.isInteger(value) || value < 0) {
        nextErrors[name] = `${name} must be a non-negative integer`;
      }
    }

    if (parsedDistance !== undefined && (Number.isNaN(parsedDistance) || parsedDistance < 0)) {
      nextErrors.distanceKm = "distanceKm must be a non-negative number";
    }

    if (
      parsedHeartRate !== undefined &&
      (Number.isNaN(parsedHeartRate) || parsedHeartRate < 30 || parsedHeartRate > 240)
    ) {
      nextErrors.heartRateAvg = "heartRateAvg must be between 30 and 240";
    }

    // Defense in depth: number inputs already block most non-numeric input at
    // the browser level, but a script/HTML string forced into these fields
    // (e.g. programmatic paste) should never reach the API either.
    const rawFields: Array<[string, string]> = [
      ["steps", steps],
      ["heartRateAvg", heartRateAvg],
      ["workoutMinutes", workoutMinutes],
      ["distanceKm", distanceKm],
      ["caloriesBurned", caloriesBurned],
      ["sleepMinutes", sleepMinutes],
    ];
    for (const [name, value] of rawFields) {
      if (value && containsDangerousInput(value)) {
        nextErrors[name] = "Invalid characters detected. HTML and scripts are not allowed.";
      }
    }

    const customMetricMap: Record<string, number> = {};
    customMetrics.forEach((row, index) => {
      const metricKey = row.key.trim();
      const rawValue = row.value.trim();
      const keyField = `metricKey-${index}`;
      const valueField = `metricValue-${index}`;

      if (!metricKey && !rawValue) return;
      if (!metricKey) {
        nextErrors[keyField] = "Metric name is required";
        return;
      }
      if (containsDangerousInput(metricKey)) {
        nextErrors[keyField] = "Metric name has invalid characters";
        return;
      }
      if (!rawValue) {
        nextErrors[valueField] = "Metric value is required";
        return;
      }
      if (containsDangerousInput(rawValue)) {
        nextErrors[valueField] = "Invalid characters detected. HTML and scripts are not allowed.";
        return;
      }
      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        nextErrors[valueField] = "Metric value must be a non-negative number";
        return;
      }
      customMetricMap[metricKey] = numericValue;
    });

    if (
      !hasAnyMetric ||
      (parsedSteps === undefined &&
        parsedHeartRate === undefined &&
        parsedWorkout === undefined &&
        parsedDistance === undefined &&
        parsedCalories === undefined &&
        parsedSleep === undefined &&
        Object.keys(customMetricMap).length === 0)
    ) {
      nextErrors.metrics = "Please provide at least one measurable metric";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await submitDailyActivity({
      date,
      steps: parsedSteps,
      heartRateAvg: parsedHeartRate,
      workoutMinutes: parsedWorkout,
      distanceKm: parsedDistance,
      caloriesBurned: parsedCalories,
      sleepMinutes: parsedSleep,
      metrics: Object.keys(customMetricMap).length > 0 ? customMetricMap : undefined,
    });
    resetForm();
  };

  const errorInputClass = (field: string) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500/50" : "";

  return (
    <div className="mx-auto max-w-4xl p-2 md:p-4">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <Activity className="h-6 w-6 text-sky-300" />
          Daily Activity
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Log daily health metrics like steps, heart rate, workout time, and custom measurements.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Log today&apos;s metrics</CardTitle>
          <CardDescription>
            All fields are optional, but at least one metric is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="daily-activity-form"
            className="space-y-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <div className="space-y-1">
              <Label htmlFor="activity-date">Date</Label>
              <Input
                id="activity-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errorInputClass("date")}
              />
              {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="steps">Steps</Label>
                <Input
                  id="steps"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className={errorInputClass("steps")}
                />
                {errors.steps && <p className="text-xs text-red-400">{errors.steps}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="heart-rate">Heart Rate Avg (bpm)</Label>
                <Input
                  id="heart-rate"
                  type="number"
                  min={30}
                  max={240}
                  step={1}
                  inputMode="numeric"
                  value={heartRateAvg}
                  onChange={(e) => setHeartRateAvg(e.target.value)}
                  className={errorInputClass("heartRateAvg")}
                />
                {errors.heartRateAvg && (
                  <p className="text-xs text-red-400">{errors.heartRateAvg}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="workout-minutes">Workout Minutes</Label>
                <Input
                  id="workout-minutes"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={workoutMinutes}
                  onChange={(e) => setWorkoutMinutes(e.target.value)}
                  className={errorInputClass("workoutMinutes")}
                />
                {errors.workoutMinutes && (
                  <p className="text-xs text-red-400">{errors.workoutMinutes}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="distance-km">Distance (km)</Label>
                <Input
                  id="distance-km"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className={errorInputClass("distanceKm")}
                />
                {errors.distanceKm && (
                  <p className="text-xs text-red-400">{errors.distanceKm}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="calories-burned">Calories Burned</Label>
                <Input
                  id="calories-burned"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className={errorInputClass("caloriesBurned")}
                />
                {errors.caloriesBurned && (
                  <p className="text-xs text-red-400">{errors.caloriesBurned}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sleep-minutes">Sleep Minutes</Label>
                <Input
                  id="sleep-minutes"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={sleepMinutes}
                  onChange={(e) => setSleepMinutes(e.target.value)}
                  className={errorInputClass("sleepMinutes")}
                />
                {errors.sleepMinutes && (
                  <p className="text-xs text-red-400">{errors.sleepMinutes}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Metrics</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addCustomMetric}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add metric
                </Button>
              </div>
              {customMetrics.length === 0 && (
                <p className="text-xs text-white/50">
                  Add custom metrics like waterMl, floorsClimbed, or cyclingMinutes.
                </p>
              )}
              {customMetrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <div>
                    <Input
                      placeholder="Metric name"
                      maxLength={64}
                      value={metric.key}
                      onChange={(e) => updateCustomMetric(index, "key", e.target.value)}
                      className={errorInputClass(`metricKey-${index}`)}
                    />
                    {errors[`metricKey-${index}`] && (
                      <p className="mt-1 text-xs text-red-400">{errors[`metricKey-${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      placeholder="Value"
                      value={metric.value}
                      onChange={(e) => updateCustomMetric(index, "value", e.target.value)}
                      className={errorInputClass(`metricValue-${index}`)}
                    />
                    {errors[`metricValue-${index}`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`metricValue-${index}`]}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-red-400"
                    onClick={() => removeCustomMetric(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.metrics && <p className="text-xs text-red-400">{errors.metrics}</p>}
            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            {lastMessage && !submitError && (
              <p className="text-sm text-emerald-400">{lastMessage}</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          <GradientButton type="submit" form="daily-activity-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Daily Activity"}
          </GradientButton>
          <Button
            type="button"
            variant="outline"
            className="bg-white/5 border-white/15 text-white hover:bg-white/10"
            onClick={resetForm}
          >
            Clear
          </Button>
        </CardFooter>
      </Card>

      {lastSavedActivity && (
        <Card className="mt-4">
          <CardContent>
            <h2 className="mb-2 text-sm font-semibold text-white">Last saved</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                <CalendarDays className="h-3 w-3" />
                date: {lastSavedActivity.date}
              </Badge>
              {lastSavedActivity.steps !== undefined && (
                <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                  <Footprints className="h-3 w-3" />
                  steps: {lastSavedActivity.steps}
                </Badge>
              )}
              {lastSavedActivity.heartRateAvg !== undefined && (
                <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                  <HeartPulse className="h-3 w-3" />
                  heartRateAvg: {lastSavedActivity.heartRateAvg}
                </Badge>
              )}
              {lastSavedActivity.workoutMinutes !== undefined && (
                <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                  <Dumbbell className="h-3 w-3" />
                  workoutMinutes: {lastSavedActivity.workoutMinutes}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
