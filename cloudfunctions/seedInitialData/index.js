const cloud = require("wx-server-sdk");
const {
  stores,
  categories,
  dishes,
} = require("./seed-data");

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

async function upsertById(collectionName, records) {
  const collection = db.collection(collectionName);
  let inserted = 0;
  let updated = 0;

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const query = await collection
      .where({
        id: record.id,
      })
      .limit(1)
      .get();

    if (query.data && query.data.length) {
      const currentRecord = query.data[0];
      await collection.doc(currentRecord._id).update({
        data: record,
      });
      updated += 1;
      continue;
    }

    await collection.add({
      data: record,
    });
    inserted += 1;
  }

  return {
    inserted,
    updated,
    total: records.length,
  };
}

exports.main = async (event) => {
  try {
    const allowSeed = event && event.confirm === true;

    if (!allowSeed) {
      return fail(
        "这是开发期一次性初始化函数，请显式传入 confirm: true 后再执行",
        40011
      );
    }

    const storeResult = await upsertById("stores", stores);
    const categoryResult = await upsertById("categories", categories);
    const dishResult = await upsertById("dishes", dishes);

    return success({
      stores: storeResult,
      categories: categoryResult,
      dishes: dishResult,
    });
  } catch (error) {
    return fail(error.message || "初始化测试数据失败", 50001);
  }
};
