const {
  normalizeOrder,
  buildOrderDisplayList,
} = require("../order");

function defaultText(value) {
  return value || "";
}

function buildShortIntro(description) {
  const safeDescription = defaultText(description).trim();

  if (!safeDescription) {
    return "";
  }

  return safeDescription.length > 24
    ? `${safeDescription.slice(0, 24)}...`
    : safeDescription;
}

function adaptStoreToRestaurant(store) {
  const safeStore = store || {};

  return {
    id: safeStore.id || "",
    name: defaultText(safeStore.name),
    shortIntro: buildShortIntro(safeStore.description),
    intro: defaultText(safeStore.description),
    description: defaultText(safeStore.description),
    address: defaultText(safeStore.address),
    phone: defaultText(safeStore.phone),
    businessHours: defaultText(safeStore.businessHours),
    coverImage: defaultText(safeStore.coverImage),
    notice: defaultText(safeStore.notice),
    status: safeStore.status || "active",
  };
}

function adaptCategories(categories) {
  return (categories || []).map((category) => ({
    id: category.id,
    storeId: category.storeId,
    name: defaultText(category.name),
    sort: Number(category.sort || 0),
    status: category.status || "active",
  }));
}

function adaptDishes(dishes) {
  return (dishes || []).map((dish) => ({
    id: dish.id,
    storeId: dish.storeId,
    categoryId: dish.categoryId,
    name: defaultText(dish.name),
    description: defaultText(dish.description),
    price: Number(dish.price || 0),
    image: defaultText(dish.image),
    unit: defaultText(dish.unit) || "份",
    tag: defaultText(dish.tag),
    status: dish.status || "active",
    sort: Number(dish.sort || 0),
  }));
}

function buildOrderSummary(items) {
  return (items || []).map((item) => item.name).join("、");
}

function adaptOrder(order) {
  const normalizedOrder = normalizeOrder(order);

  return {
    ...normalizedOrder,
    summary: normalizedOrder.summary || buildOrderSummary(normalizedOrder.items),
  };
}

function adaptOrderList(orderList) {
  return buildOrderDisplayList((orderList || []).map(adaptOrder));
}

module.exports = {
  adaptCategories,
  adaptDishes,
  adaptOrder,
  adaptOrderList,
  adaptStoreToRestaurant,
};
