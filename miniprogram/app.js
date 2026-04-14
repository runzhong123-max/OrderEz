const { restaurant, categories, dishes } = require("./data/menu");
const { mockOrders } = require("./data/orders");
const {
  normalizeCartItems,
  addDishToCart,
  updateCartItemQuantity,
  removeCartItem,
  buildCartState,
  getCartCount,
} = require("./utils/cart");
const { createOrder, createPaymentRequest } = require("./services/order");

const CART_STORAGE_KEY = "order-ez-cart";
const ORDER_STORAGE_KEY = "order-ez-orders";
const CART_TAB_INDEX = 2;

function cloneOrderList(orderList) {
  return orderList.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => ({ ...item })),
  }));
}

function loadOrderList() {
  const storedOrders = wx.getStorageSync(ORDER_STORAGE_KEY);

  if (Array.isArray(storedOrders) && storedOrders.length) {
    return cloneOrderList(storedOrders);
  }

  return cloneOrderList(mockOrders);
}

App({
  onLaunch() {
    this.globalData = {
      restaurant,
      categories,
      dishes,
      cartItems: normalizeCartItems(wx.getStorageSync(CART_STORAGE_KEY)),
      orders: loadOrderList(),
      pendingPayment: null,
    };

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

  getCartState() {
    return buildCartState(this.globalData.cartItems, this.globalData.dishes);
  },

  getOrders() {
    return cloneOrderList(this.globalData.orders);
  },

  persistCart() {
    wx.setStorageSync(CART_STORAGE_KEY, this.globalData.cartItems);
    this.updateCartBadge();
  },

  persistOrders() {
    wx.setStorageSync(ORDER_STORAGE_KEY, this.globalData.orders);
  },

  updateCartBadge() {
    const totalCount = getCartCount(this.globalData.cartItems);

    if (!totalCount) {
      wx.removeTabBarBadge({
        index: CART_TAB_INDEX,
      });
      return;
    }

    wx.setTabBarBadge({
      index: CART_TAB_INDEX,
      text: totalCount > 99 ? "99+" : String(totalCount),
    });
  },

  addDishToCartById(dishId) {
    const dish = this.globalData.dishes.find((item) => item.id === dishId);

    if (!dish) {
      return {
        success: false,
        message: "没有找到这道菜",
      };
    }

    this.globalData.cartItems = addDishToCart(this.globalData.cartItems, dish);
    this.persistCart();

    return {
      success: true,
      cartState: this.getCartState(),
    };
  },

  changeCartItemQuantity(dishId, delta) {
    this.globalData.cartItems = updateCartItemQuantity(
      this.globalData.cartItems,
      dishId,
      delta
    );
    this.persistCart();

    return this.getCartState();
  },

  removeCartItemById(dishId) {
    this.globalData.cartItems = removeCartItem(this.globalData.cartItems, dishId);
    this.persistCart();

    return this.getCartState();
  },

  clearCart() {
    this.globalData.cartItems = [];
    this.persistCart();
  },

  submitOrder() {
    const cartState = this.getCartState();

    if (cartState.isEmpty) {
      return {
        success: false,
        message: "购物车还是空的",
      };
    }

    const order = createOrder(cartState, this.globalData.restaurant);
    this.globalData.orders = [order].concat(this.globalData.orders);
    this.globalData.pendingPayment = createPaymentRequest(order);

    this.persistOrders();
    this.clearCart();

    return {
      success: true,
      order,
      paymentRequest: this.globalData.pendingPayment,
    };
  },
});
