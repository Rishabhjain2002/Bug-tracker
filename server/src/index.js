require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
// Express 5 leaves req.body undefined when no JSON body is sent
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Express 5 forwards errors thrown in async handlers to errorHandler, so no try/catch is needed
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tickets', require('./routes/tickets'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Failed to initialise database', err);
    process.exit(1);
  });
