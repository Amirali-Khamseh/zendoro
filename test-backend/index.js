const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/zendoro_test",
});

const JWT_SECRET = process.env.JWT_SECRET || "zendoro-test-secret";

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function todoRow(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    dueDate: r.due_date,
    userId: r.user_id,
  };
}

function reminderRow(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date ? r.date.toISOString().split("T")[0] : null,
    time: r.time,
    priority: r.priority,
    completed: r.completed,
    todoId: r.todo_id ?? null,
    userId: r.user_id,
  };
}

// Two-way completion sync between a todo and its linked reminders.

// Called after a todo's status changes: bring its reminders in line.
async function syncRemindersToTodo(todoId, status, userId) {
  if (todoId == null) return;
  if (status === "Done" || status === "Kill") {
    await pool.query(
      "UPDATE reminders SET completed = true WHERE todo_id = $1 AND user_id = $2",
      [todoId, userId]
    );
  } else if (status === "TODO" || status === "In Progress") {
    await pool.query(
      "UPDATE reminders SET completed = false WHERE todo_id = $1 AND user_id = $2",
      [todoId, userId]
    );
  }
}

// Called after a linked reminder's completion changes: nudge the parent todo.
async function syncTodoToReminders(todoId, userId) {
  if (todoId == null) return;
  const { rows: siblings } = await pool.query(
    "SELECT completed FROM reminders WHERE todo_id = $1 AND user_id = $2",
    [todoId, userId]
  );
  if (siblings.length === 0) return;
  const allDone = siblings.every((s) => s.completed);
  const { rows: todoRows } = await pool.query(
    "SELECT status FROM todos WHERE id = $1 AND user_id = $2",
    [todoId, userId]
  );
  const status = todoRows[0]?.status;
  if (status == null) return;
  if (allDone && status !== "Done" && status !== "Kill") {
    await pool.query(
      "UPDATE todos SET status = 'Done' WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );
  } else if (!allDone && status === "Done") {
    await pool.query(
      "UPDATE todos SET status = 'In Progress' WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );
    const user = rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ message: "User created", user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Todos ─────────────────────────────────────────────────────────────────────

app.get("/todo", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows.map(todoRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/todo", auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO todos (title, description, status, due_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, status || "TODO", dueDate || null, req.userId]
    );
    res.json(todoRow(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/todo/:id", auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const { rows } = await pool.query(
      `UPDATE todos SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        due_date = COALESCE($4::timestamp, due_date)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title, description, status, dueDate || null, req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    // If the status changed, bring linked reminders in line (two-way sync).
    if (status !== undefined) {
      await syncRemindersToTodo(rows[0].id, rows[0].status, req.userId);
    }
    res.json(todoRow(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/todo/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM todos WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Habits ────────────────────────────────────────────────────────────────────

app.get("/hobby", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM hobbies WHERE user_id = $1",
      [req.userId]
    );
    res.json(
      rows.map((r) => ({ id: r.id, name: r.name, completions: r.completions }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/hobby", auth, async (req, res) => {
  try {
    const { name, completions } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO hobbies (name, completions, user_id) VALUES ($1, $2, $3) RETURNING *",
      [
        name,
        completions || [false, false, false, false, false, false, false],
        req.userId,
      ]
    );
    const r = rows[0];
    res.json({ id: r.id, name: r.name, completions: r.completions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/hobby/:id", auth, async (req, res) => {
  try {
    const { name, completions } = req.body;
    const { rows } = await pool.query(
      `UPDATE hobbies SET
        name = COALESCE($1, name),
        completions = COALESCE($2, completions)
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [name, completions, req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    const r = rows[0];
    res.json({ id: r.id, name: r.name, completions: r.completions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/hobby/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM hobbies WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Reminders ────────────────────────────────────────────────────────────────

app.get("/reminder", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM reminders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows.map(reminderRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/reminder", auth, async (req, res) => {
  try {
    const { title, description, date, time, priority, completed, todoId } =
      req.body;
    const { rows } = await pool.query(
      "INSERT INTO reminders (title, description, date, time, priority, completed, todo_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        title,
        description,
        date || null,
        time,
        priority || "low",
        completed || false,
        todoId ?? null,
        req.userId,
      ]
    );
    res.json(reminderRow(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/reminder/:id", auth, async (req, res) => {
  try {
    const { title, description, date, time, priority, completed, todoId } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE reminders SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        date = COALESCE($3::date, date),
        time = COALESCE($4, time),
        priority = COALESCE($5, priority),
        completed = COALESCE($6, completed),
        todo_id = COALESCE($7, todo_id)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [
        title,
        description,
        date || null,
        time,
        priority,
        completed,
        todoId ?? null,
        req.params.id,
        req.userId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    // If completion changed on a linked reminder, nudge the parent todo.
    if (completed !== undefined && rows[0].todo_id != null) {
      await syncTodoToReminders(rows[0].todo_id, req.userId);
    }
    res.json(reminderRow(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/reminder/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM reminders WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Goals ─────────────────────────────────────────────────────────────────────

// Format a pg DATE (returned as a local-midnight Date) as YYYY-MM-DD using
// local calendar parts. Using toISOString here would shift the day in
// timezones ahead of UTC, mirroring the bug the reminder code avoids.
function formatDateLocal(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Enrich goal rows with the ids of their linked todos / habits / reminders so
// the frontend can compute progress from items it already has loaded.
async function attachGoalLinks(goalRows) {
  if (goalRows.length === 0) return [];
  const ids = goalRows.map((g) => g.id);
  const [td, hb, rm] = await Promise.all([
    pool.query("SELECT goal_id, todo_id FROM goal_todos WHERE goal_id = ANY($1)", [ids]),
    pool.query("SELECT goal_id, habit_id FROM goal_habits WHERE goal_id = ANY($1)", [ids]),
    pool.query("SELECT goal_id, reminder_id FROM goal_reminders WHERE goal_id = ANY($1)", [ids]),
  ]);
  return goalRows.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? null,
    targetDate: formatDateLocal(g.target_date),
    status: g.status,
    todoIds: td.rows.filter((r) => r.goal_id === g.id).map((r) => r.todo_id),
    habitIds: hb.rows.filter((r) => r.goal_id === g.id).map((r) => r.habit_id),
    reminderIds: rm.rows.filter((r) => r.goal_id === g.id).map((r) => r.reminder_id),
    userId: g.user_id,
  }));
}

// Replace the link rows for a goal. `undefined` arrays are left untouched; an
// empty array clears that link type.
async function setGoalLinks(goalId, { todoIds, habitIds, reminderIds }) {
  if (todoIds !== undefined) {
    await pool.query("DELETE FROM goal_todos WHERE goal_id = $1", [goalId]);
    for (const todoId of todoIds) {
      await pool.query(
        "INSERT INTO goal_todos (goal_id, todo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [goalId, todoId]
      );
    }
  }
  if (habitIds !== undefined) {
    await pool.query("DELETE FROM goal_habits WHERE goal_id = $1", [goalId]);
    for (const habitId of habitIds) {
      await pool.query(
        "INSERT INTO goal_habits (goal_id, habit_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [goalId, habitId]
      );
    }
  }
  if (reminderIds !== undefined) {
    await pool.query("DELETE FROM goal_reminders WHERE goal_id = $1", [goalId]);
    for (const reminderId of reminderIds) {
      await pool.query(
        "INSERT INTO goal_reminders (goal_id, reminder_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [goalId, reminderId]
      );
    }
  }
}

app.get("/goal", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(await attachGoalLinks(rows));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/goal", auth, async (req, res) => {
  try {
    const { title, description, targetDate, status, todoIds, habitIds, reminderIds } =
      req.body;
    const { rows } = await pool.query(
      "INSERT INTO goals (title, description, target_date, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description ?? null, targetDate || null, status || "active", req.userId]
    );
    const goal = rows[0];
    await setGoalLinks(goal.id, { todoIds, habitIds, reminderIds });
    const [withLinks] = await attachGoalLinks([goal]);
    res.json(withLinks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/goal/:id", auth, async (req, res) => {
  try {
    const { title, description, targetDate, status, todoIds, habitIds, reminderIds } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE goals SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        target_date = COALESCE($3, target_date),
        status = COALESCE($4, status)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [
        title ?? null,
        description ?? null,
        targetDate || null,
        status ?? null,
        req.params.id,
        req.userId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    await setGoalLinks(rows[0].id, { todoIds, habitIds, reminderIds });
    const [withLinks] = await attachGoalLinks([rows[0]]);
    res.json(withLinks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/goal/:id", auth, async (req, res) => {
  try {
    // Link rows are removed by the ON DELETE CASCADE on the join tables.
    await pool.query("DELETE FROM goals WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Timer modes ───────────────────────────────────────────────────────────────

app.get("/timer", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM timer_modes WHERE user_id = $1",
      [req.userId]
    );
    res.json(
      rows.map((r) => ({
        name: r.name,
        focusTime: r.focus_time,
        shortBreak: r.short_break,
        longBreak: r.long_break,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/timer", auth, async (req, res) => {
  try {
    const { name, focusTime, shortBreak, longBreak } = req.body;
    const { rows: existing } = await pool.query(
      "SELECT id FROM timer_modes WHERE user_id = $1 AND name = $2",
      [req.userId, name]
    );
    if (existing.length > 0) {
      await pool.query(
        "UPDATE timer_modes SET focus_time = $1, short_break = $2, long_break = $3 WHERE user_id = $4 AND name = $5",
        [focusTime, shortBreak, longBreak, req.userId, name]
      );
    } else {
      await pool.query(
        "INSERT INTO timer_modes (name, focus_time, short_break, long_break, user_id) VALUES ($1, $2, $3, $4, $5)",
        [name, focusTime, shortBreak, longBreak, req.userId]
      );
    }
    res.json({ message: "Timer mode saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/timer/session-count", auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { rows } = await pool.query(
      "SELECT session_count FROM session_counts WHERE user_id = $1 AND date = $2",
      [req.userId, today]
    );
    res.json({ data: { sessionCount: rows[0]?.session_count || 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/timer/session-count", auth, async (req, res) => {
  try {
    const { sessionCount, date } = req.body;
    const d = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const { rows: existing } = await pool.query(
      "SELECT id FROM session_counts WHERE user_id = $1 AND date = $2",
      [req.userId, d]
    );
    if (existing.length > 0) {
      await pool.query(
        "UPDATE session_counts SET session_count = $1 WHERE user_id = $2 AND date = $3",
        [sessionCount, req.userId, d]
      );
    } else {
      await pool.query(
        "INSERT INTO session_counts (session_count, date, user_id) VALUES ($1, $2, $3)",
        [sessionCount, d, req.userId]
      );
    }
    res.json({ message: "Session count updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Agent (stub) ──────────────────────────────────────────────────────────────

app.post("/agent/chat", auth, (_req, res) => {
  res.json({ content: "AI agent is not available in local test mode." });
});

// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Zendoro test backend running on http://localhost:${PORT}`)
);
