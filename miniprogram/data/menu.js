const restaurant = {
  name: "小满食堂",
  shortIntro: "现点现做，吃顿舒服的家常饭。",
  intro:
    "店里主打热乎家常菜和当日小炒，口味清爽不重油，适合一个人吃饭，也适合和朋友随便坐坐。",
  notice: "厨房正在备餐，招牌菜大约 15 分钟出餐。",
  businessHours: "11:00 - 21:30",
  address: "幸福里街口 18 号",
  coverImage: "/images/default-goods-image.png",
};

const categories = [
  {
    id: "special",
    name: "招牌推荐",
  },
  {
    id: "staple",
    name: "主食热菜",
  },
  {
    id: "drink",
    name: "汤饮小食",
  },
];

const dishes = [
  {
    id: "braised-pork-rice",
    categoryId: "special",
    name: "梅干菜扣肉饭",
    price: 32,
    description: "肥瘦相间，搭一碗热饭刚刚好。",
    image: "/images/default-goods-image.png",
    tag: "招牌",
  },
  {
    id: "pepper-beef",
    categoryId: "special",
    name: "青椒牛肉",
    price: 46,
    description: "现炒牛肉配脆口青椒，下饭很稳。",
    image: "/images/default-goods-image.png",
    tag: "现炒",
  },
  {
    id: "tomato-egg-noodle",
    categoryId: "staple",
    name: "番茄鸡蛋面",
    price: 24,
    description: "汤头清爽，酸甜开胃，适合想吃点热乎的。",
    image: "/images/default-goods-image.png",
  },
  {
    id: "mushroom-chicken-rice",
    categoryId: "staple",
    name: "香菇滑鸡饭",
    price: 28,
    description: "鸡腿肉软嫩，米饭粒粒分明。",
    image: "/images/default-goods-image.png",
  },
  {
    id: "seaweed-soup",
    categoryId: "drink",
    name: "海带排骨汤",
    price: 16,
    description: "小火慢炖，口味清淡，适合配餐。",
    image: "/images/default-goods-image.png",
  },
  {
    id: "rice-wine-balls",
    categoryId: "drink",
    name: "桂花米酒小圆子",
    price: 14,
    description: "甜口收尾，暖暖的，不会太腻。",
    image: "/images/default-goods-image.png",
  },
];

module.exports = {
  restaurant,
  categories,
  dishes,
};
