const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  return next(new Error('Access denied. Admins only.'));
};

module.exports = { adminMiddleware };
