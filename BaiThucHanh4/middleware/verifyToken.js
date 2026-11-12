// Xác thực qua service Bài TH2: GET {AUTH_SERVICE_URL}/auth
module.exports = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ message: 'Thiếu token' });
  }

  let authRes;
  try {
    authRes = await fetch(`${process.env.AUTH_SERVICE_URL}/auth`, {
      headers: { Authorization: header },
    });
  } catch (err) {
    return res.status(503).json({ message: 'Không kết nối được dịch vụ xác thực' });
  }

  if (authRes.status === 401 || authRes.status === 403) {
    return res.status(authRes.status).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
  if (!authRes.ok) {
    return res.status(503).json({ message: 'Dịch vụ xác thực lỗi' });
  }

  req.authHeader = header; // dùng lại để gọi service sản phẩm
  next();
};
