import { describe, it, expect } from "vitest";
import { computeGoalProgress, progressForGoal } from "./goalProgress";
import type { Todo } from "@/zustand/todoStore";
import type { Habit } from "@/zustand/habbitStore";
import type { Reminder } from "@/zustand/reminderStore";
import type { Goal } from "@/zustand/goalStore";

// ── Builders ────────────────────────────────────────────────────────────────

const todo = (id: number, status: Todo["status"]): Todo => ({
  id,
  title: `todo ${id}`,
  description: "",
  status,
  dueDate: null,
});

const reminder = (id: number, completed: boolean): Reminder => ({
  id,
  title: `reminder ${id}`,
  date: new Date(2026, 0, 1),
  time: "10:00",
  priority: "low",
  completed,
});

// `doneDays` = how many of the 7 weekday slots are completed.
const habit = (id: number | string, doneDays: number): Habit => ({
  id: id as unknown as string,
  name: `habit ${id}`,
  completions: Array.from({ length: 7 }, (_, i) => i < doneDays) as Habit["completions"],
});

// ── computeGoalProgress ───────────────────────────────────────────────────────

describe("computeGoalProgress", () => {
  it("reports an empty goal with no linked items", () => {
    const p = computeGoalProgress([], [], []);
    expect(p).toEqual({
      percent: 0,
      todos: { done: 0, total: 0 },
      reminders: { done: 0, total: 0 },
      habits: { ratio: 0, count: 0 },
      isEmpty: true,
    });
  });

  it("counts a single completed todo as 100%", () => {
    const p = computeGoalProgress([todo(1, "Done")], [], []);
    expect(p.percent).toBe(100);
    expect(p.todos).toEqual({ done: 1, total: 1 });
    expect(p.isEmpty).toBe(false);
  });

  it("treats TODO / In Progress as not done", () => {
    const p = computeGoalProgress([todo(1, "TODO"), todo(2, "In Progress")], [], []);
    expect(p.percent).toBe(0);
    expect(p.todos).toEqual({ done: 0, total: 2 });
  });

  it("excludes 'Kill' todos from both numerator and denominator", () => {
    // 1 done + 1 killed → killed is ignored, so 1/1 = 100%, not 1/2 = 50%.
    const p = computeGoalProgress([todo(1, "Done"), todo(2, "Kill")], [], []);
    expect(p.percent).toBe(100);
    expect(p.todos).toEqual({ done: 1, total: 1 });
  });

  it("counts completed reminders", () => {
    const p = computeGoalProgress(
      [],
      [],
      [reminder(1, true), reminder(2, false), reminder(3, false)],
    );
    expect(p.reminders).toEqual({ done: 1, total: 3 });
    expect(p.percent).toBe(33); // round(1/3 * 100)
  });

  it("scores a habit by its current-week completion ratio", () => {
    // one habit at 4/7 days → 57% (round(4/7*100))
    const p = computeGoalProgress([], [habit(1, 4)], []);
    expect(p.habits).toEqual({ ratio: 4 / 7, count: 1 });
    expect(p.percent).toBe(57);
  });

  it("averages the ratio across multiple habits", () => {
    const p = computeGoalProgress([], [habit(1, 7), habit(2, 0)], []);
    // (1.0 + 0) / 2 contributions over 2 habits → 50%
    expect(p.percent).toBe(50);
    expect(p.habits.ratio).toBe(0.5);
    expect(p.habits.count).toBe(2);
  });

  it("blends todos, reminders, and habits with equal weight", () => {
    // todo done (1) + reminder done (1) + habit 7/7 (1) over 3 units = 100%
    const p = computeGoalProgress(
      [todo(1, "Done")],
      [habit(1, 7)],
      [reminder(1, true)],
    );
    expect(p.percent).toBe(100);
  });

  it("computes a realistic partial blend", () => {
    // todosDone=1 (of 2 live), remindersDone=1 (of 2), habitScore=0 (0/7 habit)
    // completed = 1 + 1 + 0 = 2; total = 2 + 2 + 1 = 5 → 40%
    const p = computeGoalProgress(
      [todo(1, "Done"), todo(2, "TODO")],
      [habit(1, 0)],
      [reminder(1, true), reminder(2, false)],
    );
    expect(p.percent).toBe(40);
    expect(p.todos.total).toBe(2);
  });

  // ── Edge cases worth flagging ──────────────────────────────────────────────

  it("EDGE: a goal linked only to 'Kill' todos reports as empty", () => {
    // All linked todos are abandoned → total collapses to 0, so the UI shows
    // "No items linked yet" even though items ARE linked. Documents current
    // behavior; see notes for the recommended fix.
    const p = computeGoalProgress([todo(1, "Kill"), todo(2, "Kill")], [], []);
    expect(p.isEmpty).toBe(true);
    expect(p.percent).toBe(0);
  });

  it("EDGE: Math.round can report 100% before genuine completion", () => {
    // 199 of 200 reminders done = 99.5% → rounds UP to 100. A future
    // auto-complete keyed on percent === 100 would fire one item early.
    const reminders = Array.from({ length: 200 }, (_, i) => reminder(i, i < 199));
    const p = computeGoalProgress([], [], reminders);
    expect(p.percent).toBe(100);
    expect(p.reminders.done).toBe(199); // ...but not actually all done
  });

  it("EDGE: tiny progress rounds down to 0%", () => {
    // 1 of 300 done = 0.33% → rounds to 0, looks like no progress.
    const reminders = Array.from({ length: 300 }, (_, i) => reminder(i, i < 1));
    const p = computeGoalProgress([], [], reminders);
    expect(p.percent).toBe(0);
    expect(p.reminders.done).toBe(1);
  });
});

// ── progressForGoal (id resolution) ───────────────────────────────────────────

const makeGoal = (over: Partial<Goal>): Goal => ({
  id: 1,
  title: "g",
  description: null,
  targetDate: null,
  status: "active",
  todoIds: [],
  habitIds: [],
  reminderIds: [],
  ...over,
});

describe("progressForGoal", () => {
  it("resolves only the linked items, ignoring the rest", () => {
    const todos = [todo(1, "Done"), todo(2, "TODO"), todo(3, "Done")];
    const goal = makeGoal({ todoIds: [1, 2] }); // not 3
    const p = progressForGoal(goal, todos, [], []);
    expect(p.todos).toEqual({ done: 1, total: 2 });
  });

  it("matches habit ids whether they are integers (prod) or UUIDs (mock)", () => {
    const intHabit = habit(5, 7);
    const uuidHabit = habit("a1b2-uuid", 0);
    // goal stores one as a number and one as a string — both should match.
    const goal = makeGoal({ habitIds: [5, "a1b2-uuid"] });
    const p = progressForGoal(goal, [], [intHabit, uuidHabit], []);
    expect(p.habits.count).toBe(2);
    expect(p.habits.ratio).toBe(0.5); // (1.0 + 0) / 2
  });

  it("matches a numeric habit id stored as a string and vice versa", () => {
    const h = habit(7, 7);
    const goal = makeGoal({ habitIds: ["7"] }); // string form of a numeric id
    const p = progressForGoal(goal, [], [h], []);
    expect(p.habits.count).toBe(1);
  });

  it("EDGE: silently drops stale links to deleted items", () => {
    // goal references todo 99 which no longer exists → excluded, no crash.
    const goal = makeGoal({ todoIds: [1, 99], reminderIds: [42] });
    const p = progressForGoal(goal, [todo(1, "Done")], [], []);
    expect(p.todos).toEqual({ done: 1, total: 1 });
    expect(p.reminders).toEqual({ done: 0, total: 0 });
  });

  it("returns an empty result when nothing is linked", () => {
    const p = progressForGoal(makeGoal({}), [todo(1, "Done")], [], []);
    expect(p.isEmpty).toBe(true);
  });
});
