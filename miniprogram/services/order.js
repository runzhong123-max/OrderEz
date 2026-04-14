const { normalizeAmount, sumAmounts } = require("../utils/amount");

const DEFAULT_STORE_ID = "store-001";
const DEFAULT_ORDER_TYPE = "dine_in";
const DEFAULT_ORDER_SOURCE = "miniapp_customer";

const ORDER_STATUS_TEXT_MAP = {
  pending: "待商家确认",
  accepted: "商家已接单",
  preparing: "正在制作",
  ready: "可以取餐了",
  completed: "已完成",
  cancelled: "已取消",
};

const PAYMENT_STATUS_TEXT_MAP = {
  unpaid: "待支付",
  paid: "已支付",
  refunded: "已退款",
  failed: "支付未完成",
};

const ORDER_STATUS_ALIAS_MAP = {
  pending: "pending",
  accepted: "accepted",
  preparing: "preparing",
  ready: "ready",
  completed: "completed",
  cancelled: "cancelled",
  "待接单": "pending",
  "待商家确认": "pending",
  "已接单": "accepted",
  "商家已接单": "accepted",
  "制作中": "preparing",
  "正在制作": "preparing",
  "待取餐": "ready",
  "可以取餐了": "ready",
  "已完成": "completed",
  "已取消": "cancelled",
};

const PAYMENT_STATUS_ALIAS_MAP = {
  unpaid: "unpaid",
  paid: "paid",
  refunded: "refunded",
  failed: "failed",
  "待支付": "unpaid",
  "已支付": "paid",
  "已退款": "refunded",
  "支付未完成": "failed",
  "支付失败": "failed",
};

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

function normalizeOrderStatus(status) {
  return ORDER_STATUS_ALIAS_MAP[status] || "pending";
}

function normalizePaymentStatus(status) {
  return PAYMENT_STATUS_ALIAS_MAP[status] || "unpaid";
}

function getOrderStatusText(status) {
  return ORDER_STATUS_TEXT_MAP[normalizeOrderStatus(status)] || "待商家确认";
}

function getPaymentStatusText(status) {
  return PAYMENT_STATUS_TEXT_MAP[normalizePaymentStatus(status)] || "待支付";
}

function normalizeOrderItem(item) {
  const quantity = Number(item && item.quantity) || 0;
  const price = normalizeAmount(item && item.price);
  const lineAmount = normalizeAmount(
    item && item.lineAmount !== undefined ? item.lineAmount : price * quantity
  );

  return {
    dishId: (item && item.dishId) || "",
    name: (item && item.name) || "",
    price,
    lineAmount,
    unit: (item && item.unit) || "份",
    quantity,
  };
}

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function normalizeOrder(order, restaurant) {
  const safeOrder = order || {};
  const safeItems = Array.isArray(safeOrder.items)
    ? safeOrder.items.map(normalizeOrderItem).filter((item) => item.name)
    : [];
  const createdAt = safeOrder.createdAt || formatDateTime(new Date());
  const itemsTotalAmount = sumAmounts(
    safeItems.map((item) => item.lineAmount || normalizeAmount(item.price * item.quantity))
  );
  const totalAmount = normalizeAmount(
    safeOrder.totalAmount !== undefined ? safeOrder.totalAmount : itemsTotalAmount
  );
  const discountAmount = normalizeAmount(safeOrder.discountAmount);
  const payableAmount = normalizeAmount(
    safeOrder.payableAmount !== undefined
      ? safeOrder.payableAmount
      : totalAmount - discountAmount
  );
  const orderNo = safeOrder.orderNo || safeOrder.id || buildOrderId();
  const storeId =
    safeOrder.storeId ||
    (restaurant && restaurant.id) ||
    DEFAULT_STORE_ID;

  return {
    ...safeOrder,
    id: safeOrder.id || orderNo,
    orderNo,
    storeId,
    orderType: safeOrder.orderType || DEFAULT_ORDER_TYPE,
    items: safeItems,
    itemCount: Number(safeOrder.itemCount) || getItemCount(safeItems),
    summary: safeOrder.summary || buildOrderSummary(safeItems),
    totalAmount,
    discountAmount,
    payableAmount,
    status: normalizeOrderStatus(safeOrder.status),
    paymentStatus: normalizePaymentStatus(safeOrder.paymentStatus),
    source: safeOrder.source || DEFAULT_ORDER_SOURCE,
    createdAt,
    updatedAt: safeOrder.updatedAt || createdAt,
  };
}

function normalizeOrderList(orderList, restaurant) {
  if (!Array.isArray(orderList)) {
    return [];
  }

  return orderList.map((order) => normalizeOrder(order, restaurant));
}

function buildOrderDisplay(order) {
  const normalizedOrder = normalizeOrder(order);

  return {
    ...normalizedOrder,
    statusText: getOrderStatusText(normalizedOrder.status),
    paymentStatusText: getPaymentStatusText(normalizedOrder.paymentStatus),
  };
}

function buildOrderDisplayList(orderList, restaurant) {
  return normalizeOrderList(orderList, restaurant).map((order) => ({
    ...order,
    statusText: getOrderStatusText(order.status),
    paymentStatusText: getPaymentStatusText(order.paymentStatus),
  }));
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
  const createdAt = formatDateTime(new Date());
  const id = buildOrderId();
  const totalAmount = normalizeAmount(cartState.totalAmount);
  const discountAmount = 0;
  const payableAmount = normalizeAmount(totalAmount - discountAmount);

  return normalizeOrder(
    {
      id,
      orderNo: id,
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
      totalAmount,
      discountAmount,
      payableAmount,
      status: "pending",
      paymentStatus: "unpaid",
      orderType: DEFAULT_ORDER_TYPE,
      source: DEFAULT_ORDER_SOURCE,
      createdAt,
      updatedAt: createdAt,
    },
    restaurant
  );
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
  return normalizeOrder({
    ...order,
    paymentStatus: result && result.success ? "paid" : "failed",
    updatedAt: formatDateTime(new Date()),
  });
}

module.exports = {
  buildCheckoutState,
  buildOrderDisplay,
  buildOrderDisplayList,
  createOrder,
  createOrderSubmission,
  createPaymentRequest,
  getOrderStatusText,
  getPaymentStatusText,
  handlePaymentResult,
  normalizeOrder,
  normalizeOrderList,
  normalizeOrderStatus,
  normalizePaymentStatus,
};
