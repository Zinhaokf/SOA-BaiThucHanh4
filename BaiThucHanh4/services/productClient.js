// Gọi service sản phẩm (Bài TH3): GET {PRODUCT_SERVICE_URL}/products/:id
// Trả về sản phẩm, hoặc null nếu không tồn tại.
async function getProduct(productId, authHeader) {
  let res;
  try {
    res = await fetch(`${process.env.PRODUCT_SERVICE_URL}/products/${productId}`, {
      headers: { Authorization: authHeader },
    });
  } catch (err) {
    throw Object.assign(new Error('Không kết nối được dịch vụ sản phẩm'), { status: 503 });
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    throw Object.assign(new Error('Dịch vụ sản phẩm trả về lỗi'), { status: 502 });
  }
  return res.json();
}

// Lấy sản phẩm và kiểm tra đủ số lượng; ném lỗi 400 nếu không đạt.
async function getProductInStock(productId, quantity, authHeader) {
  const product = await getProduct(productId, authHeader);
  if (!product) {
    throw Object.assign(new Error(`Sản phẩm ${productId} không tồn tại`), { status: 400 });
  }
  if (product.quantity < quantity) {
    throw Object.assign(
      new Error(`Sản phẩm "${product.name}" không đủ hàng (còn ${product.quantity}, cần ${quantity})`),
      { status: 400 }
    );
  }
  return product;
}

module.exports = { getProductInStock };
