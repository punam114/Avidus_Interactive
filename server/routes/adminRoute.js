const express = require('express');
const router = express.Router();
const { getAllTasks, getUserTasks, adminDeleteTask, getAllUsers, adminCreateTask, adminUpdateTask, adminDeleteUser, adminUpdateUser, adminCreateUser } = require('../controllers/adminController');
const { auth } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// All admin routes require authentication + admin role
router.get('/tasks', auth, adminMiddleware, getAllTasks);
router.get('/tasks/user/:userId', auth, adminMiddleware, getUserTasks);
router.post('/tasks/:userId', auth, adminMiddleware, adminCreateTask);
router.patch('/tasks/:id', auth, adminMiddleware, adminUpdateTask);
router.delete('/tasks/:id', auth, adminMiddleware, adminDeleteTask);
router.get('/users', auth, adminMiddleware, getAllUsers);
router.post('/users', auth, adminMiddleware, adminCreateUser);
router.patch('/users/:id', auth, adminMiddleware, adminUpdateUser);
router.delete('/users/:id', auth, adminMiddleware, adminDeleteUser);

module.exports = router;
