// Resets the database with demo data: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');

async function seed() {
  await initDb();
  await pool.query('TRUNCATE tickets, projects, users RESTART IDENTITY CASCADE');

  const insertUser = async (name, email, password, role) => {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hash, role]
    );
    return rows[0].id;
  };

  const adminId = await insertUser('Admin User', 'admin@bugtracker.com', 'Admin@123', 'admin');
  const memberId = await insertUser('Member User', 'member@bugtracker.com', 'Member@123', 'member');

  const { rows } = await pool.query(
    'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING id',
    ['Website Revamp', 'Redesign of the company website', adminId]
  );
  const projectId = rows[0].id;

  const tickets = [
    ['Login button not responding on Safari', 'Clicking login does nothing on Safari 17', 'open', 'high', memberId],
    ['Footer links are broken', 'Privacy and Terms links return 404', 'in_progress', 'medium', memberId],
    ['Update favicon', 'Use the new brand logo as favicon', 'open', 'low', null],
  ];
  for (const [title, description, status, priority, assigneeId] of tickets) {
    await pool.query(
      `INSERT INTO tickets (title, description, status, priority, project_id, assignee_id, reporter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [title, description, status, priority, projectId, assigneeId, adminId]
    );
  }

  console.log('Database seeded');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
