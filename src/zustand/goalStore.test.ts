import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGoalStore } from "./goalStore";

// Mock auth so headers don't depend on real storage.
vi.mock("@/lib/authHelpers", () => ({ getAuthToken: () => "test-token" }));

const apiGoal = (over: Record<string, unknown> = {}) => ({
  id: 1,
  title: "Ship v1",
  description: "desc",
  targetDate: "2026-07-31",
  status: "active",
  todoIds: [1, 2],
  habitIds: [5, "uuid-9"],
  reminderIds: [3],
  userId: 1,
  ...over,
});

const mockFetchOnce = (body: unknown, ok = true) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const reset = () =>
  useGoalStore.setState({
    goals: [],
    isLoading: false,
    hasInitialized: false,
  });

beforeEach(reset);
afterEach(() => vi.unstubAllGlobals());

describe("goalStore.fetchGoals", () => {
  it("maps API goals into the store", async () => {
    mockFetchOnce([apiGoal()]);
    await useGoalStore.getState().fetchGoals();

    const goals = useGoalStore.getState().goals;
    expect(goals).toHaveLength(1);
    expect(goals[0].title).toBe("Ship v1");
    expect(goals[0].todoIds).toEqual([1, 2]);
    expect(goals[0].habitIds).toEqual([5, "uuid-9"]);
    expect(useGoalStore.getState().hasInitialized).toBe(true);
  });

  it("parses targetDate as a LOCAL date (no UTC off-by-one)", async () => {
    mockFetchOnce([apiGoal({ targetDate: "2026-07-31" })]);
    await useGoalStore.getState().fetchGoals();

    const d = useGoalStore.getState().goals[0].targetDate!;
    // Must be July 31 in local time regardless of the runner's timezone.
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // 0-based → July
    expect(d.getDate()).toBe(31);
  });

  it("keeps a null targetDate null", async () => {
    mockFetchOnce([apiGoal({ targetDate: null })]);
    await useGoalStore.getState().fetchGoals();
    expect(useGoalStore.getState().goals[0].targetDate).toBeNull();
  });

  it("falls back to an empty list on a failed request", async () => {
    mockFetchOnce({ error: "boom" }, false);
    await useGoalStore.getState().fetchGoals();
    expect(useGoalStore.getState().goals).toEqual([]);
    expect(useGoalStore.getState().hasInitialized).toBe(true);
  });
});

describe("goalStore.addGoal", () => {
  it("appends the created goal and serializes the date as YYYY-MM-DD", async () => {
    const fetchMock = mockFetchOnce(apiGoal());
    await useGoalStore.getState().addGoal({
      title: "Ship v1",
      targetDate: new Date(2026, 6, 31), // local July 31
      todoIds: [1, 2],
    });

    expect(useGoalStore.getState().goals).toHaveLength(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.targetDate).toBe("2026-07-31"); // local parts, not UTC-shifted
  });
});

describe("goalStore.updateGoal / deleteGoal", () => {
  it("replaces the updated goal in place", async () => {
    useGoalStore.setState({ goals: [apiGoal() as never] });
    mockFetchOnce(apiGoal({ title: "Renamed", status: "completed" }));

    await useGoalStore.getState().updateGoal(1, { title: "Renamed" });
    const g = useGoalStore.getState().goals[0];
    expect(g.title).toBe("Renamed");
    expect(g.status).toBe("completed");
  });

  it("EDGE: a partial update without targetDate sends null (would clear the date on prod)", async () => {
    const fetchMock = mockFetchOnce(apiGoal());
    // Caller omits targetDate — toBody still emits `targetDate: null`, which
    // the prod backend treats as "set to null". Callers must pass the full
    // goal for status-only changes (the archive action does).
    await useGoalStore.getState().updateGoal(1, { title: "x", status: "archived" });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.targetDate).toBeNull();
  });

  it("removes a goal on delete", async () => {
    useGoalStore.setState({ goals: [apiGoal() as never, apiGoal({ id: 2 }) as never] });
    mockFetchOnce({ message: "Deleted" });

    await useGoalStore.getState().deleteGoal(1);
    const goals = useGoalStore.getState().goals;
    expect(goals).toHaveLength(1);
    expect(goals[0].id).toBe(2);
  });

  it("keeps state intact and rethrows when delete fails", async () => {
    useGoalStore.setState({ goals: [apiGoal() as never] });
    mockFetchOnce({ error: "no" }, false);

    await expect(useGoalStore.getState().deleteGoal(1)).rejects.toThrow();
    expect(useGoalStore.getState().goals).toHaveLength(1); // unchanged
  });
});
