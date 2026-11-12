const db = require('../db');
const { getProductInStock } = require('../services/productClient');

const STATUSES = ['pending', 'completed', 'cancelled'];

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = () => Object.assign(new Error('Không tìm thấy đơn hàng'), { status: 404 });

exports.list = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM orders ORDER BY id');
  res.json(rows);
};

exports.get = async (req, res) => {
  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (orders.length === 0) throw notFound();
  const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
  res.json({ ...orders[0], items });
};

exports.create = async (req, res) => {
  const { customer_name, customer_email, items } = req.body || {};

  if (!customer_name || !customer_email) {
    throw badRequest('Thiếu customer_name hoặc customer_email');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('items phải là mảng có ít nhất một phần tử');
  }
  for (const it of items) {
    if (!it || !isPositiveInt(it.product_id) || !isPositiveInt(it.quantity)) {
      throw badRequest('Mỗi item cần product_id và quantity là số nguyên dương');
    }
  }

  // Gộp các dòng trùng product_id để kiểm tra tồn kho theo tổng số lượng
  const wanted = new Map();
  for (const it of items) {
    wanted.set(it.product_id, (wanted.get(it.product_id) || 0) + it.quantity);
  }

  // Kiểm tra tồn kho qua service sản phẩm (chỉ kiểm tra, không trừ kho)
  const lines = [];
  for (const [productId, quantity] of wanted) {
    const product = await getProductInStock(productId, quantity, req.authHeader);
    const unitPrice = Number(product.price);
    lines.push({
      product_id: productId,
      product_name: product.name,
      quantity,
      unit_price: unitPrice,
      total_price: Math.round(quantity * unitPrice * 100) / 100,
    });
  }
  const totalAmount = Math.round(lines.reduce((sum, l) => sum + l.total_price, 0) * 100) / 100;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO orders (customer_name, customer_email, total_amount, status) VALUES (?, ?, ?, ?)',
      [customer_name, customer_email, totalAmount, 'pending']
    );
    for (const l of lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, l.product_id, l.product_name, l.quantity, l.unit_price, l.total_price]
      );
    }
    await conn.commit();

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    const [saved] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [result.insertId]);
    res.status(201).json({ ...orders[0], items: saved });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    throw badRequest(`status phải là một trong: ${STATUSES.join(', ')}`);
  }
  const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  if (result.affectedRows === 0) throw notFound();

  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(orders[0]);
};

exports.remove = async (req, res) => {
  // order_items bị xóa theo nhờ ON DELETE CASCADE
  const [result] = await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw notFound();
  res.json({ message: 'Đã xóa đơn hàng' });
};
