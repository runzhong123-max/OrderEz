# Cloud Seed 说明

这批文件只用于开发期初始化测试数据，不属于长期业务接口的一部分。

## 包含内容
- `stores.json`
- `categories.json`
- `dishes.json`

## 建议用法

### 适合直接在控制台 JSON 导入的集合
- `stores`
- `categories`
- `dishes`

这三类数据相对稳定，而且是顾客端首页、菜单页和后续下单流程的基础数据，最适合先用控制台导入。

### 适合通过 seed 云函数写入的场景
- 你想反复重置开发环境
- 你希望以后多人协作时能一键补齐基础测试数据
- 你希望重复执行时按 `id` 自动覆盖已有记录，而不是每次手工导入

可选开发期函数：
- `cloudfunctions/seedInitialData`

调用时请显式传入：

```json
{
  "confirm": true
}
```

## 建议导入顺序
1. `stores`
2. `categories`
3. `dishes`

原因是：
- `categories` 依赖 `storeId`
- `dishes` 同时依赖 `storeId` 和 `categoryId`

## 当前为什么不建议先给 `orders` 手工灌很多测试数据
- 订单对象字段更多，后续还会继续和 `createOrder` 的真实逻辑一起收口
- 手工灌订单很容易和未来订单快照结构、状态机、支付状态约定脱节
- 当前更合理的做法是：先把店铺和菜单数据立住，后面通过真实的 `createOrder` 逐步生成订单数据
