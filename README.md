# OrderEz 餐厅点餐小程序

这是一个使用微信小程序原生语法开发的餐厅点餐小程序项目，当前版本聚焦最基础、最顺手的点餐流程。

## 项目定位

- 面向堂食点餐场景
- 当前只做基础点餐能力
- 风格追求简约、干净、自然
- 文案以真实产品表达为主，不做生硬提示

## 当前已完成页面

1. 首页
2. 菜单页
3. 购物车页
4. 订单页

## 当前功能

- 展示餐厅基础信息
- 浏览菜品分类和菜品列表
- 加入购物车
- 在购物车中增减数量、删除菜品
- 计算合计金额
- 提交本地模拟订单
- 查看模拟订单列表和订单状态

## 项目结构

```text
miniprogram/
  app.js
  app.json
  app.wxss
  data/
    menu.js
    orders.js
  services/
    order.js
  utils/
    cart.js
  pages/
    home/
    menu/
    cart/
    orders/
cloudfunctions/
AGENTS.md
README.md
```

## 数据说明

当前版本使用本地 mock 数据，不依赖真实后端：

- 菜品与餐厅信息：`miniprogram/data/menu.js`
- 模拟订单：`miniprogram/data/orders.js`
- 购物车数据：保存在小程序本地 `storage`

## 本地开发

1. 使用微信开发者工具打开项目根目录 `E:\OrderEz`
2. 确认小程序目录为 `miniprogram`
3. 编译后即可查看首页、菜单、购物车、订单四个页面

## 关键设计

### 购物车

- 购物车数据统一由 `app.js` 管理
- 金额计算集中在 `miniprogram/utils/cart.js`
- 页面只负责展示和交互，避免重复计算逻辑散落

### 订单

- 订单创建逻辑集中在 `miniprogram/services/order.js`
- 当前只做提交订单，不接真实支付
- 已为后续支付发起、支付结果处理预留接口位置

## 后续可扩展方向

- 接入真实菜品接口
- 接入订单创建接口
- 增加订单详情页
- 接入微信支付
- 拆分订单状态流转与支付状态流转

## 开发约束

- 必须使用微信小程序原生语法
- 不改用 uni-app、Taro、Vue、React 等框架
- 当前不主动引入优惠券、会员、外卖配送等复杂功能

