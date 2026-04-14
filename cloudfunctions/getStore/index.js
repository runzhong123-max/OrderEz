const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

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

async function findStoreById(storeId) {
  const { data } = await db
    .collection("stores")
    .where({
      id: storeId,
    })
    .limit(1)
    .get();

  return data[0] || null;
}

async function findDefaultStore() {
  const { data } = await db
    .collection("stores")
    .where({
      status: "active",
    })
    .limit(1)
    .get();

  return data[0] || null;
}

exports.main = async (event) => {
  try {
    const storeId = event && event.storeId;
    const store = storeId
      ? await findStoreById(storeId)
      : await findDefaultStore();

    if (!store) {
      return fail("没有找到店铺信息", 40401);
    }

    return success({
      store,
    });
  } catch (error) {
    return fail(error.message || "获取店铺信息失败", 50001);
  }
};
