const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const DEFAULT_ORDER_TYPE = "dine_in";
const DEFAULT_ORDER_SOURCE = "miniapp_customer";

function success(data) {
  return {
    code: 0,
    message: "ok",
    data,
  };
}

function fail(message, code = 40001, data = {}) {
  return {
    code,
    message,
    data,
  };
}

function normalizeAmount(amount) {
  return Number(Number(amount || 0).toFixed(2));
}

function buildOrderNo() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ];

  return `${parts.join("")}${String(Date.now()).slice(-4)}`;
}

function buildTimestamp() {
  return new Date().toISOString();
}

async function resolveStoreId(storeId) {
  if (storeId) {
    return storeId;
  }

  const { data } = await db
    .collection("stores")
    .where({
      status: "active",
    })
    .limit(1)
    .get();

  return data[0] && data[0].id;
}

exports.main = async (event) => {
  try {
    const inputItems = Array.isArray(event && event.items) ? event.items : [];

    if (!inputItems.length) {
      return fail("订单里还没有菜品", 40011);
    }

    const storeId = await resolveStoreId(event && event.storeId);

    if (!storeId) {
      return fail("没有找到可用店铺", 40411);
    }

    const dishIds = inputItems
      .map((item) => item && item.dishId)
      .filter(Boolean);

    if (!dishIds.length) {
      return fail("订单里的菜品信息不完整", 40012);
    }

    const { data: dishDocs } = await db
      .collection("dishes")
      .where({
        storeId,
        id: _.in(dishIds),
      })
      .get();

    const dishMap = (dishDocs || []).reduce((map, dish) => {
      map[dish.id] = dish;
      return map;
    }, {});

    const orderItems = [];

    for (let index = 0; index < inputItems.length; index += 1) {
      const inputItem = inputItems[index] || {};
      const dish = dishMap[inputItem.dishId];
      const quantity = Number(inputItem.quantity || 0);

      if (!dish) {
        return fail("有菜品不存在或已下架", 40013);
      }

      if (dish.status !== "active") {
        return fail(`菜品 ${dish.name} 当前不可下单`, 40014);
      }

      if (!quantity || quantity < 1) {
        return fail("菜品数量不正确", 40015);
      }

      const price = normalizeAmount(dish.price);
      const lineAmount = normalizeAmount(price * quantity);

      orderItems.push({
        dishId: dish.id,
        name: dish.name,
        price,
        quantity,
        unit: dish.unit || "份",
        lineAmount,
        image: dish.image || "",
        tag: dish.tag || "",
      });
    }

    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = normalizeAmount(
      orderItems.reduce((sum, item) => sum + item.lineAmount, 0)
    );
    const discountAmount = 0;
    const payableAmount = normalizeAmount(totalAmount - discountAmount);
    const createdAt = buildTimestamp();
    const orderNo = buildOrderNo();
    const userContext = cloud.getWXContext();
    const userId =
      userContext.OPENID || (event && event.devUserId) || "";

    const order = {
      id: orderNo,
      orderNo,
      storeId,
      userId,
      customerName: (event && event.customerName) || "",
      orderType: (event && event.orderType) || DEFAULT_ORDER_TYPE,
      tableNo: (event && event.tableNo) || "",
      pickupCode: "",
      remark: (event && event.remark) || "",
      items: orderItems,
      itemCount,
      totalAmount,
      discountAmount,
      payableAmount,
      status: "pending",
      paymentStatus: "unpaid",
      source: (event && event.source) || DEFAULT_ORDER_SOURCE,
      createdAt,
      updatedAt: createdAt,
    };

    await db.collection("orders").add({
      data: order,
    });

    return success({
      order,
      payment: {
        required: false,
        paymentStatus: "unpaid",
      },
    });
  } catch (error) {
    return fail(error.message || "创建订单失败", 50003);
  }
};
