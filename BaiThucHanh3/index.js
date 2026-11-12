require('dotenv').config();
const express = require('express');
const productsRouter = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/products', productsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Product service chạy tại http://localhost:${PORT}`);
});