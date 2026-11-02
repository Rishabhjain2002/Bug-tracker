const router = require('express').Router();
const {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');

// Ownership rules (reporter / assignee / admin) are checked inside the controller
router.use(authenticate);

router.get('/', listTickets);
router.get('/:id', getTicket);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
