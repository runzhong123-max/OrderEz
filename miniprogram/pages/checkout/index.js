Page({
  data: {
    checkoutState: {
      restaurantName: "",
      items: [],
      totalCount: 0,
      totalAmount: 0,
      isEmpty: true,
    },
    isSubmitting: false,
  },

  onShow() {
    this.syncCheckoutState();
  },

  syncCheckoutState() {
    const app = getApp();

    this.setData({
      checkoutState: app.getCheckoutState(),
    });
  },

  goBackCart() {
    wx.navigateBack({
      delta: 1,
      fail() {
        wx.switchTab({
          url: "/pages/cart/index",
        });
      },
    });
  },

  goMenu() {
    wx.switchTab({
      url: "/pages/menu/index",
    });
  },

  confirmOrder() {
    if (this.data.isSubmitting) {
      return;
    }

    const app = getApp();
    const checkoutState = app.getCheckoutState();

    if (checkoutState.isEmpty) {
      wx.showToast({
        title: "购物车还是空的",
        icon: "none",
      });
      this.syncCheckoutState();
      return;
    }

    this.setData({
      isSubmitting: true,
    });

    const result = app.submitOrder();

    if (!result.success) {
      this.setData({
        isSubmitting: false,
      });

      wx.showToast({
        title: result.message,
        icon: "none",
      });
      this.syncCheckoutState();
      return;
    }

    wx.showToast({
      title: "下单成功",
      icon: "success",
    });

    this.setData({
      isSubmitting: false,
    });

    wx.switchTab({
      url: "/pages/orders/index",
    });
  },
});
