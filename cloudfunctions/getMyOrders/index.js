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

exports.main = async (event) => {
  try {
    const page = Math.max(Number((event && event.page) || 1), 1);
    const pageSize = Math.min(
      Math.max(Number((event && event.pageSize) || 20), 1),
      50
    );
    const status = event && event.status;
    const userContext = cloud.getWXContext();
    const userId =
      userContext.OPENID || (event && event.devUserId) || "";

    if (!userId) {
      return success({
        list: [],
        pagination: {
          page,
          pageSize,
          total: 0,
        },
      });
    }

    let query = db.collection("orders").where({
      userId,
    });

    if (status) {
      query = db.collection("orders").where({
        userId,
        status,
      });
    }

    const totalRes = await query.count();
    const listRes = await query
      .orderBy("createdAt", "desc")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return success({
      list: listRes.data || [],
      pagination: {
        page,
        pageSize,
        total: totalRes.total || 0,
      },
    });
  } catch (error) {
    return fail(error.message || "获取订单列表失败", 50004);
  }
};
