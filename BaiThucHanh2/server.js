require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/verifyToken');

const app = express();
app.use(express.json());

app.use('/', authRoutes);

// API "Hello World" của bài TH1
app.get('/hello', verifyToken, (req, res) => {
  res.send('Hello World');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server chạy tại http://localhost:${process.env.PORT || 3000}`);
});