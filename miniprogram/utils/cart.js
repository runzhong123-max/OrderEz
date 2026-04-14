const {
  normalizeAmount,
  multiplyAmount,
  sumAmounts,
} = require("./amount");

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems
    .filter((item) => item && item.dishId && item.quantity > 0)
    .map((item) => ({
      dishId: item.dishId,
      quantity: Number(item.quantity) || 1,
    }));
}

function buildDishIndex(dishes) {
  const safeDishes = Array.isArray(dishes) ? dishes : [];

  return safeDishes.reduce((dishMap, dish) => {
    dishMap[dish.id] = dish;
    return dishMap;
  }, {});
}

function buildCartQuantityMap(cartItems) {
  return normalizeCartItems(cartItems).reduce((quantityMap, item) => {
    quantityMap[item.dishId] = item.quantity;
    return quantityMap;
  }, {});
}

function addDishToCart(cartItems, dishId) {
  const nextItems = normalizeCartItems(cartItems);
  const targetIndex = nextItems.findIndex((item) => item.dishId === dishId);

  if (targetIndex > -1) {
    nextItems[targetIndex] = {
      ...nextItems[targetIndex],
      quantity: nextItems[targetIndex].quantity + 1,
    };
    return nextItems;
  }

  return nextItems.concat({
    dishId,
    quantity: 1,
  });
}

function updateCartItemQuantity(cartItems, dishId, delta) {
  return normalizeCartItems(cartItems)
    .map((item) => {
      if (item.dishId !== dishId) {
        return item;
      }

      return {
        ...item,
        quantity: item.quantity + delta,
      };
    })
    .filter((item) => item.quantity > 0);
}

function removeCartItem(cartItems, dishId) {
  return normalizeCartItems(cartItems).filter((item) => item.dishId !== dishId);
}

function getCartCount(cartItems) {
  return normalizeCartItems(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

function buildCartState(cartItems, dishes) {
  const dishMap = buildDishIndex(dishes);
  const safeItems = normalizeCartItems(cartItems);

  const items = safeItems.map((item) => {
    const dish = dishMap[item.dishId] || {};
    const price = normalizeAmount(dish.price);
    const lineAmount = multiplyAmount(price, item.quantity);

    return {
      dishId: item.dishId,
      quantity: item.quantity,
      name: dish.name || "",
      description: dish.description || "",
      price,
      unit: dish.unit || "份",
      image: dish.image || "/images/default-goods-image.png",
      tag: dish.tag || "",
      lineAmount,
      subtotal: lineAmount,
    };
  }).filter((item) => item.name);

  const totalAmount = sumAmounts(items.map((item) => item.lineAmount));
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalAmount,
    totalCount,
    isEmpty: !items.length,
  };
}

function buildMenuState(options) {
  const safeOptions = options || {};
  const safeCategories = Array.isArray(safeOptions.categories)
    ? safeOptions.categories
    : [];
  const safeDishes = Array.isArray(safeOptions.dishes) ? safeOptions.dishes : [];
  const quantityMap = buildCartQuantityMap(safeOptions.cartItems);
  const activeCategoryId =
    safeOptions.activeCategoryId || (safeCategories[0] && safeCategories[0].id) || "";
  const dishList = safeDishes
    .filter((dish) => dish.categoryId === activeCategoryId && dish.status === "on")
    .sort((prev, next) => prev.sort - next.sort)
    .map((dish) => ({
      ...dish,
      cartQuantity: quantityMap[dish.id] || 0,
    }));
  const categories = safeCategories
    .slice()
    .sort((prev, next) => prev.sort - next.sort)
    .map((category) => ({
      ...category,
      selectedCount: safeDishes
        .filter((dish) => dish.categoryId === category.id)
        .reduce((sum, dish) => sum + (quantityMap[dish.id] || 0), 0),
    }));
  const cartState = buildCartState(safeOptions.cartItems, safeDishes);

  return {
    activeCategoryId,
    categories,
    dishList,
    cartSummary: {
      totalCount: cartState.totalCount,
      totalAmount: cartState.totalAmount,
      isEmpty: cartState.isEmpty,
    },
  };
}

module.exports = {
  normalizeCartItems,
  addDishToCart,
  updateCartItemQuantity,
  removeCartItem,
  buildCartState,
  buildMenuState,
  buildCartQuantityMap,
  getCartCount,
};
