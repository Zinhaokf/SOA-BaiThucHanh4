const db = require('../db');
const { getProductInStock } = require('../services/productClient');

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

// Tính lại tổng tiền của đơn sau khi mặt hàng thay đổi
const recalcTotal = (orderId) =>
  db.query(
    `UPDATE orders
     SET total_amount = (SELECT COALESCE(SUM(total_price), 0) FROM order_items WHERE order_id = ?)
     WHERE id = ?`,
    [orderId, orderId]
  );

const findItem = async (id) => {
  const [rows] = await db.query('SELECT * FROM order_items WHERE id = ?', [id]);
  if (rows.length === 0) throw notFound('Không tìm thấy mặt hàng');
  return rows[0];
};

exports.list = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM order_items ORDER BY id');
  res.json(rows);
};

exports.get = async (req, res) => {
  res.json(await findItem(req.params.id));
};

exports.create = async (req, res) => {
  const { order_id, product_id, quantity } = req.body || {};
  if (!isPositiveInt(order_id) || !isPositiveInt(product_id) || !isPositiveInt(quantity)) {
    throw badRequest('order_id, product_id, quantity phải là số nguyên dương');
  }

  const [orders] = await db.query('SELECT id FROM orders WHERE id = ?', [order_id]);
  if (orders.length === 0) throw notFound('Không tìm thấy đơn hàng');

  const product = await getProductInStock(product_id, quantity, req.authHeader);
  const unitPrice = Number(product.price);
  const totalPrice = Math.round(quantity * unitPrice * 100) / 100;

  const [result] = await db.query(
    `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [order_id, product_id, product.name, quantity, unitPrice, totalPrice]
  );
  await recalcTotal(order_id);

  res.status(201).json(await findItem(result.insertId));
};

exports.update = async (req, res) => {
  const { quantity } = req.body || {};
  if (!isPositiveInt(quantity)) {
    throw badRequest('quantity phải là số nguyên dương');
  }

  const item = await findItem(req.params.id);
  await getProductInStock(item.product_id, quantity, req.authHeader);

  // Giữ nguyên unit_price (giá tại thời điểm đặt hàng)
  const totalPrice = Math.round(quantity * Number(item.unit_price) * 100) / 100;
  await db.query('UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?', [
    quantity,
    totalPrice,
    item.id,
  ]);
  await recalcTotal(item.order_id);

  res.json(await findItem(item.id));
};

exports.remove = async (req, res) => {
  const item = await findItem(req.params.id);
  await db.query('DELETE FROM order_items WHERE id = ?', [item.id]);
  await recalcTotal(item.order_id);
  res.json({ message: 'Đã xóa mặt hàng' });
};
