const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/zendoro_test",
});

async function waitForDb(retries = 15, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("Database ready.");
      return;
    } catch {
      console.log(`Waiting for database... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Could not connect to database after retries.");
}

async function seed() {
  await waitForDb();

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'TODO',
      due_date TIMESTAMP,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS hobbies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      completions BOOLEAN[] DEFAULT '{false,false,false,false,false,false,false}',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      date DATE,
      time VARCHAR(10),
      priority VARCHAR(10) DEFAULT 'low',
      completed BOOLEAN DEFAULT false,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS timer_modes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50),
      focus_time INTEGER,
      short_break INTEGER,
      long_break INTEGER,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_counts (
      id SERIAL PRIMARY KEY,
      session_count INTEGER DEFAULT 0,
      date DATE DEFAULT CURRENT_DATE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Skip seeding if user already exists
  const { rows: existing } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    ["test@zendoro.dev"]
  );
  if (existing.length > 0) {
    console.log("Seed data already present. Skipping.");
    await pool.end();
    return;
  }

  const passwordHash = bcrypt.hashSync("password123", 10);
  const {
    rows: [user],
  } = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
    ["Alice Demo", "test@zendoro.dev", passwordHash]
  );
  const uid = user.id;

  const today = new Date().toISOString().split("T")[0];

  // Todos — realistic mix across all statuses
  await pool.query(`
    INSERT INTO todos (title, description, status, due_date, user_id) VALUES
    ('Set up project repository', 'Initialize git repo and CI/CD pipeline', 'Done', '2026-06-20', ${uid}),
    ('Design wireframes', 'Create Figma mockups for all main screens', 'Done', '2026-06-22', ${uid}),
    ('Implement auth flow', 'Login, signup, JWT tokens', 'Done', '2026-06-23', ${uid}),
    ('Build todo CRUD', 'Create, read, update, delete todos via API', 'Done', '2026-06-24', ${uid}),
    ('Write unit tests', 'Cover core utilities and store functions', 'Done', '2026-06-24', ${uid}),
    ('Dashboard analytics', 'Build charts and KPI cards for the main dashboard', 'In Progress', '2026-06-28', ${uid}),
    ('Mobile responsive layout', 'Make all pages work well on smaller screens', 'In Progress', '2026-06-30', ${uid}),
    ('Dark mode toggle', 'Add theme switching with persisted preference', 'TODO', '2026-07-02', ${uid}),
    ('Notification system', 'In-app notifications for upcoming reminders', 'TODO', '2026-07-05', ${uid}),
    ('Export data to CSV', 'Allow users to export their todos and habits', 'TODO', '2026-07-10', ${uid}),
    ('Build native mobile app', 'React Native version — deprioritized', 'Kill', NULL, ${uid})
  `);

  // Habits — 5 habits with varied weekly completion patterns
  await pool.query(`
    INSERT INTO hobbies (name, completions, user_id) VALUES
    ('Morning workout', '{true,true,false,true,true,false,false}', ${uid}),
    ('Read 30 min', '{true,true,true,true,false,true,false}', ${uid}),
    ('Meditate', '{true,false,true,true,true,false,true}', ${uid}),
    ('No social media before 10am', '{true,true,true,false,true,true,false}', ${uid}),
    ('Drink 2L water', '{false,true,true,true,true,false,true}', ${uid})
  `);

  // Reminders — today, overdue, upcoming, and one completed
  await pool.query(`
    INSERT INTO reminders (title, description, date, time, priority, completed, user_id) VALUES
    ('Team standup', 'Daily sync with the engineering team', '${today}', '10:00', 'high', false, ${uid}),
    ('Review PR #12', 'Dashboard feature PR needs code review', '${today}', '14:00', 'medium', false, ${uid}),
    ('Submit expense report', 'Q2 expenses are overdue — finance is waiting', '2026-06-20', '17:00', 'high', false, ${uid}),
    ('Call dentist', 'Schedule appointment for next month', '2026-06-22', '09:00', 'low', false, ${uid}),
    ('Project demo', 'Demo the new dashboard to the team', '2026-06-27', '15:00', 'high', false, ${uid}),
    ('Monthly review', 'Personal OKR review session', '2026-06-30', '10:00', 'medium', false, ${uid}),
    ('Doctor appointment', 'Annual checkup', '2026-07-05', '11:30', 'medium', false, ${uid}),
    ('Setup dev environment', 'Completed task for reference', '2026-06-18', '09:00', 'low', true, ${uid})
  `);

  // Timer modes
  await pool.query(`
    INSERT INTO timer_modes (name, focus_time, short_break, long_break, user_id) VALUES
    ('Standard', ${25 * 60 * 1000}, ${5 * 60 * 1000}, ${15 * 60 * 1000}, ${uid}),
    ('Extended', ${45 * 60 * 1000}, ${10 * 60 * 1000}, ${20 * 60 * 1000}, ${uid}),
    ('Long run', ${90 * 60 * 1000}, ${15 * 60 * 1000}, ${30 * 60 * 1000}, ${uid})
  `);

  // Focus session count for today
  await pool.query(
    "INSERT INTO session_counts (session_count, date, user_id) VALUES ($1, $2, $3)",
    [7, today, uid]
  );

  console.log(`Seeded database with test user: test@zendoro.dev / password123`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
