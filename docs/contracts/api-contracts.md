# 接口契约第一版

## 文档目的
这份文档用于统一顾客端、未来商家端、未来后端在接口字段、路径、金额字段和状态字段上的定义。当前阶段先覆盖最核心的餐厅点餐流程接口，重点解决三端不再各自发明字段的问题。

本文档中的对象字段优先直接引用根目录 [data-models.md](/E:/OrderEz/data-models.md) 中的模型定义。页面展示需要的中文文案、状态中文名、按钮文案，不应直接写入接口主字段。

## 统一约束

### 1. 字段命名约束
- 店铺对象优先使用 `Store`
- 分类对象优先使用 `Category`
- 菜品对象优先使用 `Dish`
- 订单对象优先使用 `Order`
- 订单项优先使用 `OrderItem`

### 2. 金额字段约束
金额字段统一使用以下命名：

- `price`
- `lineAmount`
- `totalAmount`
- `discountAmount`
- `payableAmount`

不得使用以下散乱命名替代主字段：
- `amount`
- `sumPrice`
- `finalPrice`
- `orderPrice`

### 3. 状态字段约束
- `Order.status` 必须使用 [order-state-machine.md](/E:/OrderEz/docs/contracts/order-state-machine.md) 约定的英文值
- `Order.paymentStatus` 必须使用统一英文值
- `Dish.status` 必须使用 `active`、`sold_out`、`inactive`
- `Category.status` 必须使用 `active`、`hidden`
- `Store.status` 必须使用 `active`、`paused`、`closed`

### 4. 响应包装约束
当前建议接口统一返回以下基础结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

说明：
- `code = 0` 表示成功
- `message` 用于简短说明，不承载业务主数据
- `data` 承载核心对象或列表

分页接口可在 `data` 中补充：

```json
{
  "list": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

## 一、顾客端接口

## 1. 获取店铺信息

### 用途
顾客端首页、确认下单页、订单展示页获取当前店铺基础信息。

### 请求
- 方法：`GET`
- 路径：`/api/v1/store`

### 请求参数
- 当前阶段可不要求参数
- 后续多门店时可扩展 `storeId`

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "store": {
      "id": "store-001",
      "name": "山野食堂",
      "description": "现炒家常菜，出餐利落，口味清爽。",
      "address": "杭州市西湖区文三路 88 号",
      "phone": "0571-88886666",
      "businessHours": "10:00-21:00",
      "coverImage": "/assets/images/store-cover.jpg",
      "notice": "高峰时段请耐心等候",
      "status": "active",
      "createdAt": "2026-04-14T10:00:00+08:00",
      "updatedAt": "2026-04-14T10:00:00+08:00"
    }
  }
}
```

### 字段来源
`store` 内字段直接来自 `Store`。

## 2. 获取菜单

### 用途
顾客端菜单页获取分类和菜品信息。

### 请求
- 方法：`GET`
- 路径：`/api/v1/menu`

### 请求参数
- `storeId`
  - 类型：`string`
  - 必填：当前单店阶段可选，后续建议保留

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "storeId": "store-001",
    "categories": [
      {
        "id": "cat-hot",
        "storeId": "store-001",
        "name": "热菜",
        "sort": 10,
        "status": "active",
        "createdAt": "2026-04-14T10:00:00+08:00",
        "updatedAt": "2026-04-14T10:00:00+08:00"
      }
    ],
    "dishes": [
      {
        "id": "dish-001",
        "storeId": "store-001",
        "categoryId": "cat-hot",
        "name": "青椒牛肉",
        "description": "现炒牛肉配青椒，口感鲜香。",
        "price": 46,
        "image": "/assets/images/dishes/beef.jpg",
        "unit": "份",
        "tag": "招牌",
        "status": "active",
        "sort": 10,
        "createdAt": "2026-04-14T10:00:00+08:00",
        "updatedAt": "2026-04-14T10:00:00+08:00"
      }
    ]
  }
}
```

### 字段来源
- `categories` 中字段直接来自 `Category`
- `dishes` 中字段直接来自 `Dish`

### 约束说明
- 顾客端默认只展示 `Category.status = active` 的分类
- 顾客端默认只展示 `Dish.status = active` 的菜品
- `sold_out` 菜品是否展示为灰态，可由页面决定，但接口状态值不能改名

## 3. 创建订单

### 用途
顾客端确认下单后创建订单。

### 请求
- 方法：`POST`
- 路径：`/api/v1/orders`

### 请求体

```json
{
  "storeId": "store-001",
  "customerName": "张三",
  "orderType": "dine_in",
  "tableNo": "A08",
  "remark": "少辣",
  "items": [
    {
      "dishId": "dish-001",
      "quantity": 2
    }
  ],
  "source": "miniapp_customer"
}
```

### 请求字段说明
- `storeId`：直接对应 `Order.storeId`
- `customerName`：直接对应 `Order.customerName`
- `orderType`：直接对应 `Order.orderType`
- `tableNo`：直接对应 `Order.tableNo`
- `remark`：直接对应 `Order.remark`
- `items`：下单输入项，当前阶段最小结构可使用 `dishId + quantity`
- `source`：订单来源，建议保留，如 `miniapp_customer`

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "order": {
      "id": "order-001",
      "orderNo": "202604140001",
      "storeId": "store-001",
      "userId": "user-001",
      "customerName": "张三",
      "orderType": "dine_in",
      "tableNo": "A08",
      "pickupCode": "",
      "remark": "少辣",
      "items": [
        {
          "dishId": "dish-001",
          "name": "青椒牛肉",
          "price": 46,
          "quantity": 2,
          "unit": "份",
          "lineAmount": 92,
          "image": "/assets/images/dishes/beef.jpg",
          "tag": "招牌"
        }
      ],
      "itemCount": 2,
      "totalAmount": 92,
      "discountAmount": 0,
      "payableAmount": 92,
      "status": "pending",
      "paymentStatus": "unpaid",
      "source": "miniapp_customer",
      "createdAt": "2026-04-14T15:00:00+08:00",
      "updatedAt": "2026-04-14T15:00:00+08:00"
    },
    "payment": {
      "required": false,
      "paymentStatus": "unpaid"
    }
  }
}
```

### 字段来源
- `order` 主体字段直接来自 `Order`
- `order.items` 中字段直接来自 `OrderItem`

### 约束说明
- `items` 必须保存菜品快照，不依赖后续实时菜单渲染
- `status` 初始值建议为 `pending`
- `paymentStatus` 初始值建议为 `unpaid`
- 后续接微信支付时，在 `payment` 节点扩展支付参数，不要把支付参数直接混入 `order` 主体

## 4. 获取我的订单列表

### 用途
顾客端订单页查看自己的订单列表。

### 请求
- 方法：`GET`
- 路径：`/api/v1/my/orders`

### 请求参数
- `page`
- `pageSize`
- `status`
  - 可选，值必须来自 `Order.status`

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "order-001",
        "orderNo": "202604140001",
        "storeId": "store-001",
        "userId": "user-001",
        "customerName": "张三",
        "orderType": "dine_in",
        "tableNo": "A08",
        "pickupCode": "",
        "remark": "少辣",
        "items": [
          {
            "dishId": "dish-001",
            "name": "青椒牛肉",
            "price": 46,
            "quantity": 2,
            "unit": "份",
            "lineAmount": 92,
            "image": "/assets/images/dishes/beef.jpg",
            "tag": "招牌"
          }
        ],
        "itemCount": 2,
        "totalAmount": 92,
        "discountAmount": 0,
        "payableAmount": 92,
        "status": "pending",
        "paymentStatus": "unpaid",
        "source": "miniapp_customer",
        "createdAt": "2026-04-14T15:00:00+08:00",
        "updatedAt": "2026-04-14T15:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1
    }
  }
}
```

### 字段来源
列表项直接使用 `Order`。

### 约束说明
- 当前阶段可以直接返回完整 `items`
- 如果后续列表性能需要优化，可额外补充摘要字段，但必须先更新 `data-models.md` 和共享契约文档

## 5. 获取订单详情

### 用途
顾客端查看单笔订单详情。

### 请求
- 方法：`GET`
- 路径：`/api/v1/my/orders/{orderId}`

### 路径参数
- `orderId`
  - 类型：`string`
  - 必填：是

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "order": {
      "id": "order-001",
      "orderNo": "202604140001",
      "storeId": "store-001",
      "userId": "user-001",
      "customerName": "张三",
      "orderType": "dine_in",
      "tableNo": "A08",
      "pickupCode": "",
      "remark": "少辣",
      "items": [
        {
          "dishId": "dish-001",
          "name": "青椒牛肉",
          "price": 46,
          "quantity": 2,
          "unit": "份",
          "lineAmount": 92,
          "image": "/assets/images/dishes/beef.jpg",
          "tag": "招牌"
        }
      ],
      "itemCount": 2,
      "totalAmount": 92,
      "discountAmount": 0,
      "payableAmount": 92,
      "status": "pending",
      "paymentStatus": "unpaid",
      "source": "miniapp_customer",
      "createdAt": "2026-04-14T15:00:00+08:00",
      "updatedAt": "2026-04-14T15:00:00+08:00"
    }
  }
}
```

### 字段来源
`order` 直接使用 `Order` 和 `OrderItem`。

## 二、商家端接口

## 1. 获取店铺信息

### 用途
商家端读取当前店铺资料，用于资料维护页和商家首页。

### 请求
- 方法：`GET`
- 路径：`/api/v1/merchant/store`

### 响应结构
返回值同顾客端店铺对象，主体为 `Store`。

## 2. 更新店铺信息

### 用途
商家端维护店铺资料。

### 请求
- 方法：`PUT`
- 路径：`/api/v1/merchant/store`

### 请求体

```json
{
  "name": "山野食堂",
  "description": "现炒家常菜，出餐利落，口味清爽。",
  "address": "杭州市西湖区文三路 88 号",
  "phone": "0571-88886666",
  "businessHours": "10:00-21:00",
  "coverImage": "/assets/images/store-cover.jpg",
  "notice": "高峰时段请耐心等候",
  "status": "active"
}
```

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "store": {
      "id": "store-001",
      "name": "山野食堂",
      "description": "现炒家常菜，出餐利落，口味清爽。",
      "address": "杭州市西湖区文三路 88 号",
      "phone": "0571-88886666",
      "businessHours": "10:00-21:00",
      "coverImage": "/assets/images/store-cover.jpg",
      "notice": "高峰时段请耐心等候",
      "status": "active",
      "createdAt": "2026-04-14T10:00:00+08:00",
      "updatedAt": "2026-04-14T16:00:00+08:00"
    }
  }
}
```

### 字段来源
请求和响应核心字段都直接来自 `Store`。

### 扩展点
- `coverImage` 当前可以直接保存图片 URL 或资源标识
- 后续接真实上传时，不改字段名，只补上传接口或文件服务

## 3. 获取分类列表

### 用途
商家端查看和维护分类。

### 请求
- 方法：`GET`
- 路径：`/api/v1/merchant/categories`

### 请求参数
- `storeId`
- `status`

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "cat-hot",
        "storeId": "store-001",
        "name": "热菜",
        "sort": 10,
        "status": "active",
        "createdAt": "2026-04-14T10:00:00+08:00",
        "updatedAt": "2026-04-14T10:00:00+08:00"
      }
    ]
  }
}
```

### 字段来源
列表项直接来自 `Category`。

## 4. 新增分类

### 用途
商家端新增菜单分类。

### 请求
- 方法：`POST`
- 路径：`/api/v1/merchant/categories`

### 请求体

```json
{
  "storeId": "store-001",
  "name": "热菜",
  "sort": 10,
  "status": "active"
}
```

### 响应结构
返回新增后的 `category` 对象，字段直接来自 `Category`。

## 5. 编辑分类

### 用途
商家端编辑分类名称、排序和状态。

### 请求
- 方法：`PUT`
- 路径：`/api/v1/merchant/categories/{categoryId}`

### 请求体

```json
{
  "name": "热菜",
  "sort": 20,
  "status": "active"
}
```

### 响应结构
返回更新后的 `category` 对象，字段直接来自 `Category`。

## 6. 获取菜品列表

### 用途
商家端查看菜品，支持按分类和状态筛选。

### 请求
- 方法：`GET`
- 路径：`/api/v1/merchant/dishes`

### 请求参数
- `storeId`
- `categoryId`
- `status`
- `page`
- `pageSize`

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "dish-001",
        "storeId": "store-001",
        "categoryId": "cat-hot",
        "name": "青椒牛肉",
        "description": "现炒牛肉配青椒，口感鲜香。",
        "price": 46,
        "image": "/assets/images/dishes/beef.jpg",
        "unit": "份",
        "tag": "招牌",
        "status": "active",
        "sort": 10,
        "createdAt": "2026-04-14T10:00:00+08:00",
        "updatedAt": "2026-04-14T10:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1
    }
  }
}
```

### 字段来源
列表项直接来自 `Dish`。

## 7. 新增菜品

### 用途
商家端录入新菜品。

### 请求
- 方法：`POST`
- 路径：`/api/v1/merchant/dishes`

### 请求体

```json
{
  "storeId": "store-001",
  "categoryId": "cat-hot",
  "name": "青椒牛肉",
  "description": "现炒牛肉配青椒，口感鲜香。",
  "price": 46,
  "image": "/assets/images/dishes/beef.jpg",
  "unit": "份",
  "tag": "招牌",
  "status": "active",
  "sort": 10
}
```

### 响应结构
返回新增后的 `dish` 对象，字段直接来自 `Dish`。

## 8. 编辑菜品

### 用途
商家端修改菜品资料。

### 请求
- 方法：`PUT`
- 路径：`/api/v1/merchant/dishes/{dishId}`

### 请求体

```json
{
  "categoryId": "cat-hot",
  "name": "青椒牛肉",
  "description": "现炒牛肉配青椒，口感鲜香。",
  "price": 46,
  "image": "/assets/images/dishes/beef.jpg",
  "unit": "份",
  "tag": "招牌",
  "status": "active",
  "sort": 10
}
```

### 响应结构
返回更新后的 `dish` 对象，字段直接来自 `Dish`。

## 9. 更新菜品状态

### 用途
商家端快速切换菜品状态，如在售、售罄、下架。

### 请求
- 方法：`PATCH`
- 路径：`/api/v1/merchant/dishes/{dishId}/status`

### 请求体

```json
{
  "status": "sold_out"
}
```

### 响应结构
返回更新后的 `dish` 对象，字段直接来自 `Dish`。

### 约束说明
- 不得使用 `on`、`off`、`soldout` 这类非统一值
- 页面文案可以显示“在售”“售罄”“下架”，但接口字段必须是统一英文值

## 10. 获取订单列表

### 用途
商家端查看订单并按状态处理。

### 请求
- 方法：`GET`
- 路径：`/api/v1/merchant/orders`

### 请求参数
- `storeId`
- `status`
- `paymentStatus`
- `page`
- `pageSize`

### 响应结构
返回分页 `list`，列表项直接使用 `Order`。

### 约束说明
- 当前阶段建议直接返回完整 `Order.items`
- 后续如需摘要优化，先更新共享模型和契约文档

## 11. 更新订单状态

### 用途
商家端推进订单履约状态。

### 请求
- 方法：`PATCH`
- 路径：`/api/v1/merchant/orders/{orderId}/status`

### 请求体

```json
{
  "status": "accepted"
}
```

### 响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "order": {
      "id": "order-001",
      "orderNo": "202604140001",
      "storeId": "store-001",
      "userId": "user-001",
      "customerName": "张三",
      "orderType": "dine_in",
      "tableNo": "A08",
      "pickupCode": "",
      "remark": "少辣",
      "items": [
        {
          "dishId": "dish-001",
          "name": "青椒牛肉",
          "price": 46,
          "quantity": 2,
          "unit": "份",
          "lineAmount": 92,
          "image": "/assets/images/dishes/beef.jpg",
          "tag": "招牌"
        }
      ],
      "itemCount": 2,
      "totalAmount": 92,
      "discountAmount": 0,
      "payableAmount": 92,
      "status": "accepted",
      "paymentStatus": "paid",
      "source": "miniapp_customer",
      "createdAt": "2026-04-14T15:00:00+08:00",
      "updatedAt": "2026-04-14T15:10:00+08:00"
    }
  }
}
```

### 约束说明
- `status` 的合法流转必须遵循 [order-state-machine.md](/E:/OrderEz/docs/contracts/order-state-machine.md)
- 不允许商家端自行跳过契约，直接写入未定义状态

## 三、顾客端与商家端的共享对象说明

### 1. 店铺对象
- 顾客端和商家端共用 `Store`
- 顾客端只消费展示相关字段
- 商家端负责维护完整字段

### 2. 菜单对象
- 顾客端和商家端共用 `Category`、`Dish`
- 商家端拥有写权限，顾客端默认只读
- 页面层可做过滤和映射，但不改底层字段命名

### 3. 订单对象
- 顾客端和商家端共用 `Order`、`OrderItem`
- 顾客端偏查看与提交
- 商家端偏处理与状态流转

## 四、对当前顾客端的直接约束
结合当前顾客端项目，后续优先适配以下内容：

- 店铺信息从当前 `intro`、`shortIntro` 逐步收敛到 `description` 和 `notice`
- 分类补齐 `storeId`、`status`、`createdAt`、`updatedAt`
- 菜品状态从当前 `on`、`soldout`、`off` 迁移到 `active`、`sold_out`、`inactive`
- 订单对象补齐 `orderNo`、`storeId`、`userId`、`customerName`、`orderType`、`itemCount`、`discountAmount`、`source`、`updatedAt`
- 订单和支付状态从中文值迁移到统一英文值

## 五、当前阶段暂不展开的内容
- 用户登录鉴权细节
- 支付参数签名和支付单对象
- 复杂退款接口
- 优惠券、会员、积分等营销接口
- 多门店切换和跨店数据隔离细节

这些能力后续要新增时，仍然必须先改 `data-models.md` 和共享契约文档，再进入代码实现。
