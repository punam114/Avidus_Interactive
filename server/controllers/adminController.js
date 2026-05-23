const Task = require('../model/task');
const User = require('../model/User');

/**
 * @desc    Admin - Get all tasks across all users
 * @route   GET /api/admin/tasks
 * @access  Private/Admin
 */
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate('userId', 'name email role');

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin - Get all tasks of a specific user
 * @route   GET /api/admin/tasks/user/:userId
 * @access  Private/Admin
 */
const getUserTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const tasks = await Task.find({ userId: req.params.userId });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin - Delete any task
 * @route   DELETE /api/admin/tasks/:id
 * @access  Private/Admin
 */
const adminDeleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted by admin successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin - Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const adminCreateTask = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { title, description, status } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a task title');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const task = await Task.create({
      title,
      description,
      status: status !== undefined ? status : false,
      userId,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const adminUpdateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getUserTasks,
  adminDeleteTask,
  getAllUsers,
  adminCreateTask,
  adminUpdateTask,
};
