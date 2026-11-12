const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Dịch vụ đăng nhập: POST localhost:3000/
router.post('/', async (req, res) => {
  const { userName, password } = req.body; 

  if (!userName || !password) {
    return res.status(400).json({ message: 'Thiếu userName hoặc password' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM `User` WHERE UserName = ? AND Password = ?',
      [userName, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { idUser: user.IdUser, userName: user.UserName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Lưu token vào bảng User
    await db.query('UPDATE `User` SET Token = ? WHERE IdUser = ?', [token, user.IdUser]);

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Dịch vụ xác thực token: GET localhost:3000/auth
router.get('/auth', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;