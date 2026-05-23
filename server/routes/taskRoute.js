const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { auth } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/', auth, createTask);
router.get('/', auth, getTasks);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
