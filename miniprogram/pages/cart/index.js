Page({
  data: {
    cartState: {
      items: [],
      totalAmount: 0,
      totalCount: 0,
      isEmpty: true,
    },
  },

  onShow() {
    this.syncCartState();
  },

  syncCartState() {
    const app = getApp();

    this.setData({
      cartState: app.getCartState(),
    });
  },

  increaseCount(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();

    this.setData({
      cartState: app.changeCartItemQuantity(id, 1),
    });
  },

  decreaseCount(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();

    this.setData({
      cartState: app.changeCartItemQuantity(id, -1),
    });
  },

  removeItem(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();

    this.setData({
      cartState: app.removeCartItemById(id),
    });

    wx.showToast({
      title: "已从购物车移除",
      icon: "none",
    });
  },

  goMenu() {
    wx.switchTab({
      url: "/pages/menu/index",
    });
  },

  submitOrder() {
    const app = getApp();
    const result = app.submitOrder();

    if (!result.success) {
      wx.showToast({
        title: result.message,
        icon: "none",
      });
      return;
    }

    this.syncCartState();

    wx.showToast({
      title: "订单已提交",
      icon: "success",
    });

    wx.switchTab({
      url: "/pages/orders/index",
    });
  },
});
