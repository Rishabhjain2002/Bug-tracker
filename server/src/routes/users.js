const router = require('express').Router();
const { listUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// People sign up through POST /api/auth/register, or an admin adds them here
router.use(authenticate);

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', authorize('admin'), createUser);
// PATCH because only the fields sent are changed; PUT is kept for older clients
router.patch('/:id', authorize('admin'), updateUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
