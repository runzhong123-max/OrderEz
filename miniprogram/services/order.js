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

function createOrder(cartState, restaurant) {
  return {
    id: buildOrderId(),
    restaurantName: restaurant.name,
    items: cartState.items.map((item) => ({
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    summary: buildOrderSummary(cartState.items),
    totalAmount: cartState.totalAmount,
    createdAt: formatDateTime(new Date()),
    status: "待接单",
    paymentStatus: "待支付",
  };
}

function createPaymentRequest(order) {
  return {
    orderId: order.id,
    amount: order.totalAmount,
    status: "pending",
  };
}

function handlePaymentResult(order, result) {
  return {
    ...order,
    paymentStatus: result && result.success ? "已支付" : "待支付",
  };
}

module.exports = {
  createOrder,
  createPaymentRequest,
  handlePaymentResult,
};
