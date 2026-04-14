const { restaurant, categories, dishes } = require("./data/menu");
const { mockOrders } = require("./data/orders");
const {
  normalizeCartItems,
  addDishToCart,
  updateCartItemQuantity,
  removeCartItem,
  buildCartState,
  buildMenuState,
  getCartCount,
} = require("./utils/cart");
const {
  buildCheckoutState,
  buildOrderDisplayList,
  createOrderSubmission,
  normalizeOrderList,
} = require("./services/order");

const CART_STORAGE_KEY = "order-ez-cart";
const ORDER_STORAGE_KEY = "order-ez-orders";
const CART_TAB_INDEX = 2;
const CART_BADGE_DELAY = 80;

function cloneOrderList(orderList) {
  return orderList.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => ({ ...item })),
  }));
}

function loadOrderList(currentRestaurant) {
  const storedOrders = wx.getStorageSync(ORDER_STORAGE_KEY);
  const sourceOrders =
    Array.isArray(storedOrders) && storedOrders.length ? storedOrders : mockOrders;

  return normalizeOrderList(cloneOrderList(sourceOrders), currentRestaurant);
}

App({
  onLaunch() {
    const orderList = loadOrderList(restaurant);

    this.globalData = {
      restaurant,
      categories,
      dishes,
      cartItems: normalizeCartItems(wx.getStorageSync(CART_STORAGE_KEY)),
      orders: orderList,
      pendingPayment: null,
    };

    this.persistOrders();
    this.updateCartBadge();
  },

  getRestaurant() {
    return { ...this.globalData.restaurant };
  },

  getMenuData() {
    return {
      restaurant: this.getRestaurant(),
      categories: this.globalData.categories.map((item) => ({ ...item })),
      dishes: this.globalData.dishes.map((item) => ({ ...item })),
    };
  },

  getMenuState(activeCategoryId) {
    return buildMenuState({
      categories: this.globalData.categories,
      dishes: this.globalData.dishes,
      cartItems: this.globalData.cartItems,
      activeCategoryId,
    });
  },

  getCartState() {
    return buildCartState(this.globalData.cartItems, this.globalData.dishes);
  },

  getCheckoutState() {
    return buildCheckoutState(this.getCartState(), this.globalData.restaurant);
  },

  getOrders() {
    return buildOrderDisplayList(this.globalData.orders, this.globalData.restaurant);
  },

  setCartItems(cartItems) {
    this.globalData.cartItems = normalizeCartItems(cartItems);
    wx.setStorageSync(CART_STORAGE_KEY, this.globalData.cartItems);
    this.updateCartBadge();
  },

  persistOrders() {
    wx.setStorageSync(ORDER_STORAGE_KEY, this.globalData.orders);
  },

  updateCartBadge() {
    const totalCount = getCartCount(this.globalData.cartItems);
    const applyBadgeUpdate = () => {
      if (!totalCount) {
        wx.removeTabBarBadge({
          index: CART_TAB_INDEX,
          fail() {},
        });
        return;
      }

      wx.setTabBarBadge({
        index: CART_TAB_INDEX,
        text: totalCount > 99 ? "99+" : String(totalCount),
        fail() {},
      });
    };

    applyBadgeUpdate();

    if (this.cartBadgeTimer) {
      clearTimeout(this.cartBadgeTimer);
    }

    this.cartBadgeTimer = setTimeout(() => {
      applyBadgeUpdate();
      this.cartBadgeTimer = null;
    }, CART_BADGE_DELAY);
  },

  addDishToCartById(dishId) {
    const dish = this.globalData.dishes.find((item) => item.id === dishId);

    if (!dish) {
      return {
        success: false,
        message: "没有找到这道菜",
      };
    }

    if (dish.status !== "active") {
      return {
        success: false,
        message: "这道菜暂时不能点",
      };
    }

    this.setCartItems(addDishToCart(this.globalData.cartItems, dishId));

    return {
      success: true,
      cartState: this.getCartState(),
    };
  },

  changeCartItemQuantity(dishId, delta) {
    this.setCartItems(
      updateCartItemQuantity(this.globalData.cartItems, dishId, delta)
    );

    return this.getCartState();
  },

  removeCartItemById(dishId) {
    this.setCartItems(removeCartItem(this.globalData.cartItems, dishId));

    return this.getCartState();
  },

  clearCart() {
    this.setCartItems([]);
  },

  submitOrder() {
    const cartState = this.getCartState();

    if (cartState.isEmpty) {
      return {
        success: false,
        message: "购物车还是空的",
      };
    }

    const submission = createOrderSubmission(
      cartState,
      this.globalData.restaurant
    );
    this.globalData.orders = [submission.order].concat(this.globalData.orders);
    this.globalData.pendingPayment = submission.paymentRequest;

    this.persistOrders();
    this.clearCart();

    return {
      success: true,
      order: submission.order,
      paymentRequest: this.globalData.pendingPayment,
    };
  },
});
