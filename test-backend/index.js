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
    userId: r.user_id,
  };
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
    const { title, description, date, time, priority, completed } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO reminders (title, description, date, time, priority, completed, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        title,
        description,
        date || null,
        time,
        priority || "low",
        completed || false,
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
    const { title, description, date, time, priority, completed } = req.body;
    const { rows } = await pool.query(
      `UPDATE reminders SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        date = $3,
        time = COALESCE($4, time),
        priority = COALESCE($5, priority),
        completed = COALESCE($6, completed)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [
        title,
        description,
        date || null,
        time,
        priority,
        completed,
        req.params.id,
        req.userId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
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
