const router = require('express').Router();
const { listLabels, createLabel, updateLabel, deleteLabel } = require('../controllers/labelController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', listLabels);
router.post('/', authorize('admin'), createLabel);
router.put('/:id', authorize('admin'), updateLabel);
router.delete('/:id', authorize('admin'), deleteLabel);

module.exports = router;
