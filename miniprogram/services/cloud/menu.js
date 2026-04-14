const { callCloudFunction } = require("./base");
const {
  adaptCategories,
  adaptDishes,
} = require("./adapters");

async function fetchMenu(params) {
  return callCloudFunction("getMenu", params);
}

async function fetchMenuForClient(params) {
  const data = await fetchMenu(params);

  return {
    storeId: data.storeId || "",
    categories: adaptCategories(data.categories),
    dishes: adaptDishes(data.dishes),
  };
}

module.exports = {
  fetchMenu,
  fetchMenuForClient,
};
