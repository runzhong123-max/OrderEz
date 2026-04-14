function normalizePrice(value) {
  return Number(Number(value || 0).toFixed(2));
}

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems
    .filter((item) => item && item.dishId && item.quantity > 0)
    .map((item) => ({
      dishId: item.dishId,
      name: item.name || "",
      price: normalizePrice(item.price),
      image: item.image || "/images/default-goods-image.png",
      quantity: Number(item.quantity) || 1,
    }));
}

function addDishToCart(cartItems, dish) {
  const nextItems = normalizeCartItems(cartItems);
  const targetIndex = nextItems.findIndex((item) => item.dishId === dish.id);

  if (targetIndex > -1) {
    nextItems[targetIndex] = {
      ...nextItems[targetIndex],
      quantity: nextItems[targetIndex].quantity + 1,
    };
    return nextItems;
  }

  return nextItems.concat({
    dishId: dish.id,
    name: dish.name,
    price: normalizePrice(dish.price),
    image: dish.image,
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
  const dishMap = {};
  const safeDishes = Array.isArray(dishes) ? dishes : [];
  const safeItems = normalizeCartItems(cartItems);

  safeDishes.forEach((dish) => {
    dishMap[dish.id] = dish;
  });

  const items = safeItems.map((item) => {
    const dish = dishMap[item.dishId] || {};
    const subtotal = normalizePrice(item.price * item.quantity);

    return {
      ...item,
      description: dish.description || "",
      tag: dish.tag || "",
      subtotal,
    };
  });

  const totalAmount = normalizePrice(
    items.reduce((sum, item) => sum + item.subtotal, 0)
  );
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalAmount,
    totalCount,
    isEmpty: !items.length,
  };
}

module.exports = {
  normalizeCartItems,
  addDishToCart,
  updateCartItemQuantity,
  removeCartItem,
  buildCartState,
  getCartCount,
};
