# 当前顾客端对齐情况

## 文档定位
这份文档只服务于当前顾客端小程序项目，用于说明：

1. 当前顾客端已经具备哪些能力
2. 当前顾客端与统一模型、统一契约已经对齐了哪些部分
3. 当前还没有对齐的地方有哪些
4. 这些问题的优先级如何划分
5. 下一轮最小改动应该先收口什么

它不是长期共享契约文档，也不替代 `data-models.md`、状态机文档和接口契约文档。

## 一、当前顾客端已有能力
当前顾客端已经具备一条完整的本地 mock 点餐闭环，核心模块包括：

- 首页
- 菜单页
- 购物车页
- 确认下单页
- 订单页

当前数据流已经基本成形，主要集中在这些文件：

- `miniprogram/app.js`
- `miniprogram/data/menu.js`
- `miniprogram/data/orders.js`
- `miniprogram/utils/cart.js`
- `miniprogram/services/order.js`

这说明当前顾客端已经不只是静态页面原型，而是具备本地 mock 下单和订单查看能力的运行中前端。

## 二、已对齐项

### 1. 购物车最小结构已对齐
当前购物车存储结构已经收口为：

- `dishId`
- `quantity`

这与根目录 [data-models.md](/E:/OrderEz/data-models.md) 中的 `CartItem` 一致，也是当前顾客端最稳定的一部分。

### 2. 金额字段命名大体已对齐
当前顾客端已经使用这些统一金额字段：

- `price`
- `lineAmount`
- `totalAmount`
- `payableAmount`

虽然 `discountAmount` 还没有全面补齐，但命名方向已经与共享契约一致。

### 3. 订单项快照思路已对齐
当前订单项已经保留了下单时的关键快照字段，至少包括：

- `dishId`
- `name`
- `price`
- `quantity`
- `unit`
- `lineAmount`

这符合 `OrderItem` 的核心建模原则，也适合作为后续商家端和后端统一实现的参考基础。

### 4. 页面层与业务层已有基本分层
当前顾客端已经把部分业务逻辑从页面里抽出，主要收口在：

- `app.js`
- `utils/cart.js`
- `services/order.js`

这与当前共享文档要求的“页面负责展示和触发，业务逻辑集中收口”基本一致。

### 5. 下单与支付边界已有基础分离
当前顾客端虽然还没有接真实支付，但已经具备：

- 订单创建入口
- `paymentStatus` 字段
- 支付请求占位结构

这说明当前实现没有把“提交订单”和“真实支付”硬耦合在一起，方向是健康的。

## 三、未对齐项

### 1. `Dish.status` 仍在使用旧值
统一模型要求 `Dish.status` 使用：

- `active`
- `sold_out`
- `inactive`

当前顾客端仍在使用：

- `on`
- `soldout`
- `off`

涉及文件：

- `miniprogram/data/menu.js`
- `miniprogram/utils/cart.js`
- `miniprogram/app.js`

这是当前最值得优先统一的基础状态字段之一。

### 2. 订单状态和支付状态仍有中文值
统一状态要求：

- `Order.status` 使用 `pending / accepted / preparing / ready / completed / cancelled`
- `Order.paymentStatus` 使用 `unpaid / paid / refunded / failed`

当前顾客端仍有中文状态值直接写进业务数据，例如：

- `待接单`
- `制作中`
- `已完成`
- `待支付`
- `已支付`

涉及文件：

- `miniprogram/data/orders.js`
- `miniprogram/services/order.js`
- `miniprogram/pages/orders/index.wxml`

这会直接影响未来顾客端、商家端、后端之间的状态一致性。

### 3. Store 字段命名仍偏页面化
统一模型中的 `Store` 以这些字段为主：

- `id`
- `name`
- `description`
- `address`
- `phone`
- `businessHours`
- `coverImage`
- `notice`
- `status`
- `createdAt`
- `updatedAt`

当前顾客端 `restaurant` 仍主要使用：

- `name`
- `shortIntro`
- `intro`
- `notice`
- `businessHours`
- `address`
- `coverImage`

涉及文件：

- `miniprogram/data/menu.js`
- `miniprogram/pages/home/index.wxml`

其中 `intro`、`shortIntro` 更像展示字段，不适合作为三端共同业务主字段继续扩散。

### 4. `Category` 仍缺少统一字段
统一模型里的 `Category` 应至少包含：

- `id`
- `storeId`
- `name`
- `sort`
- `status`
- `createdAt`
- `updatedAt`

当前顾客端分类数据只有：

- `id`
- `name`
- `sort`

涉及文件：

- `miniprogram/data/menu.js`

### 5. `Dish` 仍缺少 `storeId` 和时间字段
当前 `Dish` 已有：

- `id`
- `categoryId`
- `name`
- `description`
- `price`
- `image`
- `unit`
- `tag`
- `status`
- `sort`

但仍缺少：

- `storeId`
- `createdAt`
- `updatedAt`

涉及文件：

- `miniprogram/data/menu.js`

### 6. 订单对象关键字段仍缺失
统一模型里的 `Order` 应至少包含：

- `id`
- `orderNo`
- `storeId`
- `userId`
- `customerName`
- `orderType`
- `tableNo`
- `pickupCode`
- `remark`
- `items`
- `itemCount`
- `totalAmount`
- `discountAmount`
- `payableAmount`
- `status`
- `paymentStatus`
- `source`
- `createdAt`
- `updatedAt`

当前顾客端订单对象仍主要依赖：

- `id`
- `restaurantName`
- `items`
- `summary`
- `totalAmount`
- `payableAmount`
- `createdAt`
- `status`
- `paymentStatus`

其中缺失的关键字段包括：

- `orderNo`
- `storeId`
- `userId`
- `customerName`
- `orderType`
- `itemCount`
- `discountAmount`
- `source`
- `updatedAt`

### 7. `storeId` 在顾客端对象里仍不稳定
当前统一模型里，`Store`、`Category`、`Dish`、`Order` 都应有明确的 `id` 或 `storeId` 关联。

当前顾客端仍是单店思路，因此：

- 菜单分类缺少 `storeId`
- 菜品缺少 `storeId`
- 订单里也没有稳定落地 `storeId`

当前单店 mock 还能运行，但未来商家端和后端都会默认把 `storeId` 当作基础字段。

## 四、优先级分层

## P0：现在就应该改，且风险低、收益高

### 1. 统一 `Dish.status`
涉及范围：

- `miniprogram/data/menu.js`
- `miniprogram/utils/cart.js`
- `miniprogram/app.js`

原因：

- 改动范围明确
- 风险低
- 对后续菜单接口和商家端状态维护收益很高

### 2. 统一 `Order.status` 和 `Order.paymentStatus`
涉及范围：

- `miniprogram/data/orders.js`
- `miniprogram/services/order.js`
- `miniprogram/app.js`

原因：

- 这是三端最容易继续分裂的地方
- 当前仍在本地 mock 阶段，收口成本低

### 3. 增加订单状态中文映射层
涉及范围：

- `miniprogram/services/order.js`
- `miniprogram/app.js`
- `miniprogram/pages/orders/index.wxml`

原因：

- 能把“英文状态值”和“自然中文展示”分开
- 不需要大改页面结构

### 4. 补齐最关键订单字段
优先补齐：

- `orderNo`
- `storeId`
- `orderType`
- `itemCount`
- `discountAmount`
- `source`
- `updatedAt`

涉及范围：

- `miniprogram/services/order.js`
- `miniprogram/data/orders.js`

原因：

- 这些字段对后续接口对齐最有价值
- 当前补齐不会破坏页面主流程

## P1：建议下一轮改，但当前可以暂缓

### 1. 统一 Store 主字段命名
建议方向：

- 以 `description` 作为统一主字段
- `shortIntro`、`intro` 逐步退到展示层或兼容层

涉及范围：

- `miniprogram/data/menu.js`
- `miniprogram/app.js`
- `miniprogram/pages/home/index.wxml`

### 2. 补齐 `Category` 的统一字段
建议补齐：

- `storeId`
- `status`
- `createdAt`
- `updatedAt`

### 3. 补齐 `Dish` 的非关键统一字段
建议补齐：

- `storeId`
- `createdAt`
- `updatedAt`

## P2：当前先记录，等后端或商家端启动后再统一处理

### 1. `userId`、`customerName` 的真实来源
当前顾客端尚未启动轻会员或真实身份体系，`userId` 和 `customerName` 暂时只能保留占位或为空。

### 2. 订单详情接口和订单列表接口的完整对象边界
当前顾客端仍是本地 mock，没有真正按接口消费数据。等后端启动后，再严格按 `api-contracts.md` 完整落地。

### 3. Store、Category、Dish 的完整时间字段策略
当前只是本地 mock，没有必要为了 `createdAt`、`updatedAt` 过度设计前端流程。等商家端和后端启动后再统一写入策略。

### 4. `summary`、`restaurantName` 这类展示字段的最终去留
它们当前仍可作为顾客端展示优化存在，但不应继续扩散成共享契约主字段。是否彻底移除，更适合等接口真正落地时统一处理。

## 五、下一轮最小改动建议
基于当前顾客端现状，下一轮最值得先做的“最小但有价值”收口是：

### 1. 统一状态值

- `Dish.status` 统一为 `active / sold_out / inactive`
- `Order.status` 统一为英文状态值
- `Order.paymentStatus` 统一为英文状态值

### 2. 把中文文案移到映射层

- 业务数据只存英文状态值
- 订单页展示时再映射自然中文

### 3. 补齐关键订单字段

- `orderNo`
- `storeId`
- `orderType`
- `itemCount`
- `discountAmount`
- `source`
- `updatedAt`

### 4. 保留现有流程，不推翻现有数据流

- 继续使用 `app.js + utils/cart.js + services/order.js`
- 不重构页面结构
- 不顺手接后端
- 不顺手接支付

## 六、文档结论
当前顾客端离统一模型已经不远，最重要的不是重做，而是把基础业务语言收口。

明确结论是：

1. 购物车结构、金额字段和订单项快照已经具备较好的基础
2. 最大的不一致，集中在状态值、订单关键字段和 Store 命名
3. 现在最值得改的是 P0 项，改完就能明显降低未来顾客端、商家端、后端三端继续分裂的风险
4. P1 和 P2 不需要一次做完，先让当前顾客端在不推翻结构的前提下更接近统一契约即可
