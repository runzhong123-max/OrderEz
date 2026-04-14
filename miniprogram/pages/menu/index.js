Page({
  data: {
    restaurant: {},
    categories: [],
    activeCategoryId: "",
    dishList: [],
    cartSummary: {
      totalCount: 0,
      totalAmount: 0,
      isEmpty: true,
    },
  },

  onLoad() {
    const app = getApp();
    const menuData = app.getMenuData();
    const firstCategory = menuData.categories[0] || {};

    this.setData({
      restaurant: menuData.restaurant,
      activeCategoryId: firstCategory.id || "",
    });

    this.syncMenuState();
  },

  onShow() {
    this.syncMenuState();
  },

  syncMenuState() {
    const app = getApp();
    const menuState = app.getMenuState(this.data.activeCategoryId);

    this.setData({
      activeCategoryId: menuState.activeCategoryId,
      categories: menuState.categories,
      dishList: menuState.dishList,
      cartSummary: menuState.cartSummary,
    });
  },

  selectCategory(e) {
    const { id } = e.currentTarget.dataset;

    this.setData({
      activeCategoryId: id,
    });

    this.syncMenuState();
  },

  addToCart(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();
    const result = app.addDishToCartById(id);

    if (!result.success) {
      wx.showToast({
        title: result.message,
        icon: "none",
      });
      return;
    }

    this.syncMenuState();

    wx.showToast({
      title: "已加入购物车",
      icon: "success",
    });
  },

  goCart() {
    wx.switchTab({
      url: "/pages/cart/index",
    });
  },
});
