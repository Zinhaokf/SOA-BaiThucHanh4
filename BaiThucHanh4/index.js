require('dotenv').config();
const express = require('express');
const verifyToken = require('./middleware/verifyToken');

const app = express();
app.use(express.json());

app.use('/orders', verifyToken, require('./routes/orders'));
app.use('/order_items', verifyToken, require('./routes/orderItems'));

// Xử lý lỗi chung (Express 5 tự chuyển lỗi của hàm async vào đây)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Lỗi server' : err.message });
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Order service chạy tại http://localhost:${port}`);
});
