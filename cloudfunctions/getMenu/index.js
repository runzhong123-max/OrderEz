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
    const storeId = await resolveStoreId(event && event.storeId);

    if (!storeId) {
      return fail("没有找到可用店铺", 40402);
    }

    const categoryRes = await db
      .collection("categories")
      .where({
        storeId,
        status: "active",
      })
      .get();

    const dishRes = await db
      .collection("dishes")
      .where({
        storeId,
        status: "active",
      })
      .get();

    const categories = (categoryRes.data || []).sort(
      (prev, next) => Number(prev.sort || 0) - Number(next.sort || 0)
    );
    const dishes = (dishRes.data || []).sort(
      (prev, next) => Number(prev.sort || 0) - Number(next.sort || 0)
    );

    return success({
      storeId,
      categories,
      dishes,
    });
  } catch (error) {
    return fail(error.message || "获取菜单失败", 50002);
  }
};
