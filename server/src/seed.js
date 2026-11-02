// Resets the database with demo data: npm run seed
// Adds only the missing demo rows and keeps everything else: npm run seed -- --keep
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');

// Sample team members log in with this password
const TEAM_PASSWORD = 'Welcome@123';

const TEAM = [
  // [key, name, email, password, role, color, job title]
  ['admin', 'Admin User', 'admin@bugtracker.com', 'Admin@123', 'admin', '#0c66e4', 'Engineering Manager'],
  ['member', 'Member User', 'member@bugtracker.com', 'Member@123', 'member', '#1f845a', 'Frontend Developer'],
  ['priya', 'Priya Sharma', 'priya@bugtracker.com', TEAM_PASSWORD, 'member', '#6e5dc6', 'Backend Developer'],
  ['arjun', 'Arjun Mehta', 'arjun@bugtracker.com', TEAM_PASSWORD, 'member', '#d97008', 'QA Engineer'],
  ['sara', 'Sara Khan', 'sara@bugtracker.com', TEAM_PASSWORD, 'member', '#ae4787', 'UI/UX Designer'],
  ['david', 'David Chen', 'david@bugtracker.com', TEAM_PASSWORD, 'admin', '#1d7f8c', 'DevOps Engineer'],
  ['neha', 'Neha Gupta', 'neha@bugtracker.com', TEAM_PASSWORD, 'member', '#c9372c', 'Full-stack Developer'],
];

const PROJECTS = [
  ['web', 'Website Revamp', 'Redesign of the company website'],
  ['mobile', 'Mobile App', 'iOS and Android app for customers'],
  ['payments', 'Payments API', 'Checkout, refunds and invoicing service'],
];

const LABELS = [
  ['bug', 'Bug', '#c9372c'],
  ['feature', 'Feature', '#1f845a'],
  ['ui', 'UI', '#ae4787'],
  ['backend', 'Backend', '#6e5dc6'],
  ['performance', 'Performance', '#d97008'],
  ['security', 'Security', '#946f00'],
  ['docs', 'Documentation', '#1d7f8c'],
];

// [title, description, status, priority, project, assignee, reporter, labels]
const TICKETS = [
  ['Login button not responding on Safari', 'Clicking login does nothing on Safari 17. No error in the console.', 'open', 'high', 'web', 'member', 'arjun', ['bug', 'ui']],
  ['Footer links are broken', 'Privacy and Terms links return 404.', 'in_progress', 'medium', 'web', 'member', 'admin', ['bug']],
  ['Update favicon', 'Use the new brand logo as favicon.', 'open', 'low', 'web', null, 'sara', ['ui']],
  ['Hero image loads slowly on 3G', 'The 2.4 MB hero image blocks first paint. Serve WebP and lazy-load below the fold.', 'in_progress', 'medium', 'web', 'neha', 'arjun', ['performance']],
  ['New pricing page design', 'Three plans with a monthly / yearly toggle. Figma link in the design channel.', 'open', 'medium', 'web', 'sara', 'admin', ['feature', 'ui']],
  ['Contact form accepts invalid emails', 'Validation only checks for an @ sign.', 'resolved', 'low', 'web', 'neha', 'arjun', ['bug']],
  ['Add dark mode', 'Follow the system setting, with a manual toggle in the header.', 'closed', 'low', 'web', 'sara', 'member', ['feature', 'ui']],
  ['App crashes when opening notifications', 'Android 14 only. Stack trace points to a null intent extra.', 'open', 'high', 'mobile', 'neha', 'arjun', ['bug']],
  ['Push notifications for order updates', 'Notify the customer when an order is shipped and delivered.', 'in_progress', 'high', 'mobile', 'priya', 'admin', ['feature', 'backend']],
  ['Onboarding screens', 'Three swipeable intro screens shown on first launch.', 'open', 'medium', 'mobile', 'sara', 'admin', ['feature', 'ui']],
  ['Biometric login', 'Face ID / fingerprint login after the first password login.', 'resolved', 'medium', 'mobile', 'member', 'david', ['feature', 'security']],
  ['Product list scroll is janky', 'Drops to ~30 fps on mid-range Android devices.', 'open', 'medium', 'mobile', null, 'arjun', ['performance']],
  ['Double charge when user taps Pay twice', 'Add an idempotency key so a retried request does not create a second charge.', 'in_progress', 'high', 'payments', 'priya', 'arjun', ['bug', 'backend']],
  ['Card numbers appear in request logs', 'Mask the PAN before logging the request body.', 'resolved', 'high', 'payments', 'david', 'priya', ['security', 'backend']],
  ['Partial refunds', 'Allow refunding part of an order amount from the admin panel.', 'open', 'medium', 'payments', 'priya', 'admin', ['feature', 'backend']],
  ['Document webhook events', 'List every event type with an example payload.', 'open', 'low', 'payments', null, 'david', ['docs']],
  ['Invoice PDF takes 8s to generate', 'Generation is synchronous; move it to a background job.', 'in_progress', 'medium', 'payments', 'david', 'neha', ['performance', 'backend']],
  ['Upgrade Node to 22 LTS', 'Node 18 is end of life. Update the Dockerfile and CI images.', 'closed', 'medium', 'payments', 'david', 'david', ['backend']],
];


// Runs `find`; if it returns no row, runs `insert`. Returns the row's id
async function findOrInsert(find, insert) {
  const { rows } = await pool.query(...find);
  if (rows[0]) return rows[0].id;
  return (await pool.query(...insert)).rows[0].id;
}

async function insertAll(items, insert) {
  const ids = {};
  for (const [key, ...values] of items) ids[key] = await insert(...values);
  return ids;
}

async function seed({ keep = process.argv.includes('--keep') } = {}) {
  await initDb();
  if (!keep) await pool.query('TRUNCATE ticket_labels, labels, tickets, projects, users RESTART IDENTITY CASCADE');

  const users = await insertAll(TEAM, async (name, email, password, role, color, jobTitle) => {
    const hash = await bcrypt.hash(password, 10);
    // An existing account keeps its password and role, and only gets a colour / job title if it has none
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, color, job_title)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET color = COALESCE(users.color, EXCLUDED.color), job_title = COALESCE(users.job_title, EXCLUDED.job_title)
       RETURNING id`,
      [name, email, hash, role, color, jobTitle]
    );
    return rows[0].id;
  });

  const projects = await insertAll(PROJECTS, (name, description) =>
    findOrInsert(
      ['SELECT id FROM projects WHERE name = $1', [name]],
      ['INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING id', [name, description, users.admin]]
    )
  );

  const labels = await insertAll(LABELS, (name, color) =>
    findOrInsert(
      ['SELECT id FROM labels WHERE name = $1', [name]],
      ['INSERT INTO labels (name, color) VALUES ($1, $2) RETURNING id', [name, color]]
    )
  );

  for (const [title, description, status, priority, project, assignee, reporter, ticketLabels] of TICKETS) {
    const ticketId = await findOrInsert(
      ['SELECT id FROM tickets WHERE title = $1 AND project_id = $2', [title, projects[project]]],
      [
        `INSERT INTO tickets (title, description, status, priority, project_id, assignee_id, reporter_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [title, description, status, priority, projects[project], users[assignee] || null, users[reporter]],
      ]
    );
    await pool.query(
      'INSERT INTO ticket_labels (ticket_id, label_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING',
      [ticketId, ticketLabels.map((key) => labels[key])]
    );
  }

  console.log(`Database ${keep ? 'topped up' : 'seeded'}: ${TEAM.length} users, ${PROJECTS.length} projects, ${LABELS.length} labels, ${TICKETS.length} tickets`);
}

module.exports = { seed };

// Run directly (npm run seed), not when imported by the tests
if (require.main === module) {
  seed()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
