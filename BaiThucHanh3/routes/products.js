const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Tất cả API sản phẩm đều phải xác thực bằng token từ service đăng nhập (Bài TH 2)
router.use(verifyToken);

// Kiểm tra dữ liệu đầu vào (partial = true cho PUT: chỉ kiểm tra trường được gửi lên)
function validate(body, partial = false) {
  const errors = [];
  const { name, price, quantity } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) errors.push('name là bắt buộc');
    else if (name.length > 255) errors.push('name tối đa 255 ký tự');
  }
  if (!partial || price !== undefined) {
    if (price === undefined || price === '' || isNaN(Number(price)) || Number(price) < 0)
      errors.push('price phải là số >= 0');
  }
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || quantity === '' || !Number.isInteger(Number(quantity)) || Number(quantity) < 0)
      errors.push('quantity phải là số nguyên >= 0');
  }
  return errors;
}

// GET localhost:3001/products - Lấy danh sách tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET localhost:3001/products/:id - Lấy chi tiết một sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST localhost:3001/products - Thêm sản phẩm mới
router.post('/', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  const { name, description = null, price, quantity } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
      [name.trim(), description, price, quantity]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Thêm sản phẩm thành công', product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT localhost:3001/products/:id - Cập nhật thông tin sản phẩm
router.put('/:id', async (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  const fields = ['name', 'description', 'price', 'quantity'].filter((f) => req.body[f] !== undefined);
  if (fields.length === 0) {
    return res.status(400).json({ message: 'Không có trường nào để cập nhật' });
  }

  try {
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (f === 'name' ? req.body[f].trim() : req.body[f]));

    const [result] = await db.query(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      [...values, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cập nhật sản phẩm thành công', product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE localhost:3001/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
