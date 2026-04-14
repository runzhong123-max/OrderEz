Page({
  data: {
    restaurant: {},
    cartCount: 0,
    orderCount: 0,
  },

  onShow() {
    const app = getApp();
    const cartState = app.getCartState();
    const orders = app.getOrders();

    this.setData({
      restaurant: app.getRestaurant(),
      cartCount: cartState.totalCount,
      orderCount: orders.length,
    });
  },

  goMenu() {
    wx.switchTab({
      url: "/pages/menu/index",
    });
  },

  goOrders() {
    wx.switchTab({
      url: "/pages/orders/index",
    });
  },
});
