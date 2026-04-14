Page({
  data: {
    restaurant: {},
    categories: [],
    activeCategoryId: "",
    dishList: [],
    cartCount: 0,
  },

  onLoad() {
    const app = getApp();
    const menuData = app.getMenuData();
    const firstCategory = menuData.categories[0] || {};

    this.setData({
      restaurant: menuData.restaurant,
      categories: menuData.categories,
      activeCategoryId: firstCategory.id || "",
    });

    this.syncDishList();
  },

  onShow() {
    this.syncCartCount();
  },

  syncDishList() {
    const app = getApp();
    const menuData = app.getMenuData();
    const activeCategoryId = this.data.activeCategoryId;
    const dishList = menuData.dishes.filter(
      (item) => item.categoryId === activeCategoryId
    );

    this.setData({
      dishList,
    });
  },

  syncCartCount() {
    const app = getApp();
    const cartState = app.getCartState();

    this.setData({
      cartCount: cartState.totalCount,
    });
  },

  selectCategory(e) {
    const { id } = e.currentTarget.dataset;

    this.setData({
      activeCategoryId: id,
    });

    this.syncDishList();
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

    this.setData({
      cartCount: result.cartState.totalCount,
    });

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
