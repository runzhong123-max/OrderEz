const mockOrders = [
  {
    id: "OD20260412001",
    items: [
      {
        dishId: "braised-pork-rice",
        name: "梅干菜扣肉饭",
        price: 32,
        quantity: 1,
      },
      {
        dishId: "rice-wine-balls",
        name: "桂花米酒小圆子",
        price: 14,
        quantity: 1,
      },
    ],
    summary: "梅干菜扣肉饭、桂花米酒小圆子",
    totalAmount: 46,
    createdAt: "2026-04-12 12:18",
    status: "已完成",
    paymentStatus: "已支付",
  },
  {
    id: "OD20260413002",
    items: [
      {
        dishId: "pepper-beef",
        name: "青椒牛肉",
        price: 46,
        quantity: 1,
      },
      {
        dishId: "seaweed-soup",
        name: "海带排骨汤",
        price: 16,
        quantity: 1,
      },
    ],
    summary: "青椒牛肉、海带排骨汤",
    totalAmount: 62,
    createdAt: "2026-04-13 18:42",
    status: "制作中",
    paymentStatus: "待支付",
  },
];

module.exports = {
  mockOrders,
};
