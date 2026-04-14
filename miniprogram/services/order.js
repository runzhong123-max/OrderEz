const { normalizeAmount } = require("../utils/amount");

function formatDateTime(date) {
  const target = date || new Date();
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  const hour = String(target.getHours()).padStart(2, "0");
  const minute = String(target.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function buildOrderSummary(items) {
  return items.map((item) => item.name).join("、");
}

function buildOrderId() {
  return `OD${Date.now()}`;
}

function buildCheckoutState(cartState, restaurant) {
  const safeCartState = cartState || {};
  const safeItems = Array.isArray(safeCartState.items) ? safeCartState.items : [];

  return {
    restaurantName: (restaurant && restaurant.name) || "",
    items: safeItems.map((item) => ({
      dishId: item.dishId,
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      unit: item.unit || "份",
      price: normalizeAmount(item.price),
      lineAmount: normalizeAmount(item.lineAmount || item.subtotal),
    })),
    totalCount: Number(safeCartState.totalCount || 0),
    totalAmount: normalizeAmount(safeCartState.totalAmount),
    isEmpty: !safeItems.length,
  };
}

function createOrder(cartState, restaurant) {
  const payableAmount = normalizeAmount(cartState.totalAmount);

  return {
    id: buildOrderId(),
    restaurantName: restaurant.name,
    items: cartState.items.map((item) => ({
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      lineAmount: item.lineAmount,
      unit: item.unit,
      quantity: item.quantity,
    })),
    summary: buildOrderSummary(cartState.items),
    totalAmount: payableAmount,
    payableAmount,
    createdAt: formatDateTime(new Date()),
    status: "待接单",
    paymentStatus: "待支付",
  };
}

function createPaymentRequest(order) {
  return {
    orderId: order.id,
    amount: order.payableAmount,
    status: "pending",
  };
}

function createOrderSubmission(cartState, restaurant) {
  const order = createOrder(cartState, restaurant);

  return {
    order,
    paymentRequest: createPaymentRequest(order),
  };
}

function handlePaymentResult(order, result) {
  return {
    ...order,
    paymentStatus: result && result.success ? "已支付" : "待支付",
  };
}

module.exports = {
  buildCheckoutState,
  createOrder,
  createOrderSubmission,
  createPaymentRequest,
  handlePaymentResult,
};
