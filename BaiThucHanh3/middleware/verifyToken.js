// Xác thực bằng cách gọi service đăng nhập (Bài TH 2): GET /auth
module.exports = async (req, res, next) => {
  const header = req.headers['authorization']; // "Bearer <token>"
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Thiếu token' });
  }

  try {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth`, {
      method: 'GET',
      headers: { Authorization: header },
    });

    if (!response.ok) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const data = await response.json();
    if (!data.valid) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Không gọi được service xác thực:', err.message);
    return res.status(503).json({ message: 'Dịch vụ xác thực không khả dụng' });
  }
};