const { callCloudFunction } = require("./base");
const {
  adaptOrder,
  adaptOrderList,
} = require("./adapters");

async function createOrderByCloud(payload) {
  return callCloudFunction("createOrder", payload);
}

async function createOrderForClient(payload) {
  const data = await createOrderByCloud(payload);

  return {
    order: adaptOrder(data.order),
    payment: data.payment || {
      required: false,
      paymentStatus: "unpaid",
    },
  };
}

async function fetchMyOrders(params) {
  return callCloudFunction("getMyOrders", params);
}

async function fetchMyOrdersForClient(params) {
  const data = await fetchMyOrders(params);

  return {
    list: adaptOrderList(data.list),
    pagination: data.pagination || {
      page: 1,
      pageSize: 20,
      total: 0,
    },
  };
}

module.exports = {
  createOrderByCloud,
  createOrderForClient,
  fetchMyOrders,
  fetchMyOrdersForClient,
};
