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

  goCheckout() {
    const app = getApp();
    const checkoutState = app.getCheckoutState();

    if (checkoutState.isEmpty) {
      wx.showToast({
        title: "购物车还是空的",
        icon: "none",
      });
      return;
    }

    wx.navigateTo({
      url: "/pages/checkout/index",
    });
  },
});
