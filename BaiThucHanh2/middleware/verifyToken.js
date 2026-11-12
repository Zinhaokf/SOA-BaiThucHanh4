const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization']; // "Bearer <token>"
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Thiếu token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // token hợp lệ, đi tiếp
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};