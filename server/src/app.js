const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// The Express app without app.listen(), so tests can send requests to it directly
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
// Express 5 leaves req.body undefined when no JSON body is sent
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Used by the hosting platform to check the API is up
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Express 5 forwards errors thrown in async handlers to errorHandler, so no try/catch is needed
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/labels', require('./routes/labels'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
