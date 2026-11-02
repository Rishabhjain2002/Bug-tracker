const router = require('express').Router();
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', authorize('admin'), createProject);
router.put('/:id', authorize('admin'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

module.exports = router;
