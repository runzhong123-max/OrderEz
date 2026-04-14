Page({
  data: {
    orders: [],
  },

  onShow() {
    const app = getApp();

    this.setData({
      orders: app.getOrders(),
    });
  },

  goMenu() {
    wx.switchTab({
      url: "/pages/menu/index",
    });
  },
});
