// API tests: npm test
// They reset a separate database (DATABASE_URL with "_test" added to its name, or TEST_DATABASE_URL),
// which is created automatically. The guard below stops them from ever touching the real database.
require('dotenv').config({ quiet: true });
const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');

const testUrl = new URL(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);
if (!process.env.TEST_DATABASE_URL) testUrl.pathname += '_test';
const testDbName = testUrl.pathname.slice(1);
if (!testDbName.includes('test')) throw new Error(`Refusing to reset "${testDbName}": its name must contain "test"`);

// db.js reads these when it is first required, so they must be set before the app is loaded
process.env.DATABASE_URL = testUrl.toString();
process.env.JWT_SECRET ||= 'test-secret';

const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/db');
const { seed } = require('../src/seed');

async function createTestDatabase() {
  const serverUrl = new URL(testUrl);
  serverUrl.pathname = '/postgres';
  const client = new Client({ connectionString: serverUrl.toString() });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDbName]);
  if (!rowCount) await client.query(`CREATE DATABASE "${testDbName}"`);
  await client.end();
}

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

const findTicket = async (token, title) =>
  (await request(app).get('/api/tickets').query({ search: title }).set('Authorization', `Bearer ${token}`)).body[0];

let admin;
let member;
const asAdmin = (req) => req.set('Authorization', `Bearer ${admin}`);
const asMember = (req) => req.set('Authorization', `Bearer ${member}`);

before(async () => {
  await createTestDatabase();
  await seed({ keep: false });
  admin = await loginAs('admin@demo.com', 'admin123');
  member = await loginAs('member@demo.com', 'member123');
});

after(() => pool.end());

describe('general', () => {
  test('health check responds', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  test('unknown route returns 404 with a message', async () => {
    const res = await request(app).get('/api/nope');
    assert.equal(res.status, 404);
    assert.match(res.body.message, /not found/);
  });
});

describe('auth', () => {
  test('protected routes need a token', async () => {
    assert.equal((await request(app).get('/api/tickets')).status, 401);
  });

  test('wrong password is rejected', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 'wrong' });
    assert.equal(res.status, 401);
  });

  test('non-string login fields are a 400, not a server error', async () => {
    const badEmail = await request(app).post('/api/auth/login').send({ email: 123, password: 'admin123' });
    assert.equal(badEmail.status, 400);
    const badPassword = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 123 });
    assert.equal(badPassword.status, 400);
  });

  test('register creates a member and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New Person', email: 'New.Person@Example.com', password: 'secret1' });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'member');
    assert.equal(res.body.user.email, 'new.person@example.com');
    assert.ok(res.body.token);
  });

  test('register validates email and rejects duplicates', async () => {
    const invalid = await request(app).post('/api/auth/register').send({ name: 'X', email: 'not-an-email', password: 'secret1' });
    assert.equal(invalid.status, 400);

    const duplicate = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'admin@demo.com', password: 'secret1' });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.message, 'Email is already registered');
  });
});

describe('role-based access', () => {
  test('only admins can create projects', async () => {
    assert.equal((await asMember(request(app).post('/api/projects')).send({ name: 'Nope' })).status, 403);
    assert.equal((await asAdmin(request(app).post('/api/projects')).send({ name: 'Test Project' })).status, 201);
  });

  test('a member cannot edit a ticket they did not report and are not assigned to', async () => {
    // Reported by the admin and assigned to Priya
    const ticket = await findTicket(admin, 'Partial refunds');
    const res = await asMember(request(app).put(`/api/tickets/${ticket.id}`)).send({ ...ticket, status: 'closed' });
    assert.equal(res.status, 403);
  });

  test('only admins can change team members', async () => {
    const res = await asMember(request(app).patch('/api/users/3')).send({ color: '#0c66e4' });
    assert.equal(res.status, 403);
  });
});

describe('tickets', () => {
  test('create with labels, then filter by label', async () => {
    const [project] = (await asMember(request(app).get('/api/projects'))).body;
    const labels = (await asMember(request(app).get('/api/labels'))).body;
    const bug = labels.find((l) => l.name === 'Bug');

    const created = await asMember(request(app).post('/api/tickets')).send({
      title: 'Search returns duplicates',
      project_id: project.id,
      label_ids: [bug.id],
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'open');
    assert.deepEqual(created.body.labels.map((l) => l.name), ['Bug']);

    const filtered = await asMember(request(app).get('/api/tickets').query({ label_id: bug.id }));
    assert.ok(filtered.body.some((t) => t.id === created.body.id));
    assert.ok(filtered.body.every((t) => t.labels.some((l) => l.id === bug.id)));
  });

  test('a title over 200 characters is a 400, not a server error', async () => {
    const [project] = (await asAdmin(request(app).get('/api/projects'))).body;
    const res = await asAdmin(request(app).post('/api/tickets')).send({ title: 'x'.repeat(201), project_id: project.id });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /at most 200/);
  });

  test('an invalid label rolls the whole update back', async () => {
    const ticket = await findTicket(admin, 'Login button not responding');
    const res = await asAdmin(request(app).put(`/api/tickets/${ticket.id}`)).send({
      ...ticket,
      title: 'Changed title',
      label_ids: [99999],
    });
    assert.equal(res.status, 400);

    const after = (await asAdmin(request(app).get(`/api/tickets/${ticket.id}`))).body;
    assert.equal(after.title, ticket.title);
    assert.deepEqual(after.labels, ticket.labels);
  });

  test('moving a ticket without label_ids keeps its labels', async () => {
    // Like a drag on the board: the body has no label_ids
    const ticket = await findTicket(admin, 'Hero image loads slowly');
    const res = await asAdmin(request(app).put(`/api/tickets/${ticket.id}`)).send({ ...ticket, status: 'resolved' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'resolved');
    assert.deepEqual(res.body.labels, ticket.labels);
  });

  test('unknown ticket returns 404', async () => {
    assert.equal((await asAdmin(request(app).get('/api/tickets/999999'))).status, 404);
  });
});

describe('team and labels', () => {
  test('admin adds a team member who can then log in', async () => {
    const res = await asAdmin(request(app).post('/api/users')).send({
      name: 'Rahul Verma',
      email: 'rahul@demo.com',
      password: 'secret1',
      color: '#946F00',
      job_title: 'Intern',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.color, '#946f00');
    assert.ok(await loginAs('rahul@demo.com', 'secret1'));
  });

  test('colours must be hex values', async () => {
    const res = await asAdmin(request(app).post('/api/labels')).send({ name: 'Bad', color: 'red' });
    assert.equal(res.status, 400);
  });

  test('duplicate label names are a 409', async () => {
    const res = await asAdmin(request(app).post('/api/labels')).send({ name: 'Bug', color: '#c9372c' });
    assert.equal(res.status, 409);
    assert.match(res.body.message, /already exists/);
  });
});
