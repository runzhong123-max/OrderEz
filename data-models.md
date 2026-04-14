# data-models.md

## 文档目的
本文档用于统一顾客端小程序、商家端小程序、后端服务三方对核心业务对象的理解。

目标：
- 统一对象名称
- 统一字段名称
- 统一字段含义
- 为接口设计、数据库设计、前后端联调提供共同依据
- 减少三端各自发明字段、各自理解流程的问题

本文档优先服务当前阶段：
- 小型餐厅点餐系统
- 微信小程序场景
- 以堂食为主
- 顾客端、商家端、后端共用一套核心业务模型
- 当前先支持基础点餐、订单、菜单维护、店铺信息维护、轻会员预留、支付预留

---

# 一、统一建模原则

## 1. 单一含义
每个字段应尽量只有一个明确含义，不要同一字段承担多个业务意义。

例如：
- `status` 只表示订单状态，不同时表示支付状态
- `paymentStatus` 单独表示支付状态

## 2. 面向业务命名
字段名称优先体现业务含义，而不是页面表现。

例如：
- 使用 `payableAmount`
- 不使用 `bottomBarPrice`

## 3. 快照与源数据分离
订单中的菜品信息应保留快照，不能完全依赖菜品主表实时读取。

原因：
- 菜名、价格、图片、状态可能变化
- 已下单订单必须能保留当时的展示与金额依据

## 4. 当前先做轻量，保留扩展口
当前阶段不做重型会员、复杂营销、复杂配送，但字段和结构应为后续扩展留出空间。

## 5. 前后端、顾客端、商家端统一字段名
同一业务对象在三端中应使用一致字段名，避免：
- 顾客端叫 `totalPrice`
- 商家端叫 `amount`
- 后端叫 `payAmount`

---

# 二、核心对象总览

当前统一以下核心对象：

1. Store（店铺）
2. Category（菜品分类）
3. Dish（菜品）
4. CartItem（购物车项）
5. Order（订单）
6. OrderItem（订单项）
7. User（用户）
8. NicknamePoolItem（随机昵称词条）
9. Message / Note（留言，当前轻量预留）

---

# 三、对象详细定义

# 1. Store（店铺）

## 作用
表示店铺本身的基础资料，用于顾客端展示、商家端维护、后端统一存储。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 店铺唯一标识 |
| name | string | 是 | 店铺名称 |
| description | string | 否 | 店铺简介 |
| address | string | 否 | 店铺地址 |
| phone | string | 否 | 联系电话 |
| businessHours | string | 否 | 营业时间描述 |
| coverImage | string | 否 | 店铺头图或封面图 |
| notice | string | 否 | 店铺公告 |
| status | string | 是 | 店铺状态，见状态约定 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- 当前阶段可先假设一个系统只服务一个店铺，但字段仍保留 `id`
- `businessHours` 当前先用字符串，后续如有需要再细分结构
- `coverImage` 当前可先用图片 URL / 本地 mock 路径，后续替换为上传后的远程地址

---

# 2. Category（菜品分类）

## 作用
表示菜单中的分类，如主食、小炒、饮品等。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 分类唯一标识 |
| storeId | string | 是 | 所属店铺 ID |
| name | string | 是 | 分类名称 |
| sort | number | 是 | 排序值，越小越靠前 |
| status | string | 是 | 分类状态，见状态约定 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- 分类是否显示不建议依赖前端自己判断，应依赖 `status`
- 当前阶段排序使用简单数字即可，不做复杂拖拽模型

---

# 3. Dish（菜品）

## 作用
表示菜单中的具体菜品，是顾客点单和商家维护的核心对象。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 菜品唯一标识 |
| storeId | string | 是 | 所属店铺 ID |
| categoryId | string | 是 | 所属分类 ID |
| name | string | 是 | 菜品名称 |
| description | string | 否 | 菜品简介 |
| price | number | 是 | 菜品单价，单位：元 |
| image | string | 否 | 菜品图片 |
| unit | string | 否 | 单位，如份、碗、杯 |
| tag | string | 否 | 标签，如推荐、招牌、特价 |
| status | string | 是 | 菜品状态，见状态约定 |
| sort | number | 是 | 排序值，越小越靠前 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- `price` 当前统一使用 number，单位为元
- 若后续需要更高精度，可在后端内部转为分处理，但三端对外显示仍以元为主
- `status` 当前已能覆盖在售、售罄、下架等需求
- 当前版本暂不支持复杂规格（大杯/小杯/加料），后续如有需要应新增规格模型，而不是污染 Dish 本体

---

# 4. CartItem（购物车项）

## 作用
表示购物车中的最小存储单元。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| dishId | string | 是 | 菜品 ID |
| quantity | number | 是 | 数量，必须大于 0 |

## 说明
- 购物车项应尽量保持最小结构
- 不在购物车存储中重复保存菜名、价格、图片等展示信息
- 购物车展示态由购物车数据 + 菜品源数据派生得到
- 这样更适合后续统一金额计算和结构维护

---

# 5. Order（订单）

## 作用
表示一次完整下单，是系统中最核心的业务对象之一。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 订单唯一标识 |
| orderNo | string | 是 | 对用户和商家可展示的订单号 |
| storeId | string | 是 | 所属店铺 ID |
| userId | string | 否 | 下单用户 ID，未登录时可为空 |
| customerName | string | 否 | 下单显示名称，如昵称/随机昵称 |
| orderType | string | 是 | 订单类型，见状态约定 |
| tableNo | string | 否 | 堂食桌号 |
| pickupCode | string | 否 | 自提取餐码，当前预留 |
| remark | string | 否 | 订单备注 |
| items | OrderItem[] | 是 | 订单项快照列表 |
| itemCount | number | 是 | 商品总份数 |
| totalAmount | number | 是 | 商品总金额 |
| discountAmount | number | 否 | 优惠金额，当前可默认为 0 |
| payableAmount | number | 是 | 实际应付金额 |
| status | string | 是 | 订单状态，见状态约定 |
| paymentStatus | string | 是 | 支付状态，见状态约定 |
| source | string | 否 | 订单来源，如 customer_miniapp |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- `totalAmount` 表示原始商品总金额
- `discountAmount` 表示优惠金额，当前可先为 0，但必须预留
- `payableAmount` 表示实际应支付金额，后续接会员折扣、特价菜、优惠活动时继续使用这个字段
- `status` 与 `paymentStatus` 必须分开
- `customerName` 是后续轻会员、叫号、堂食人情味体验的重要字段
- `orderType` 当前至少预留堂食和自提

---

# 6. OrderItem（订单项）

## 作用
表示订单里的单个菜品快照项。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| dishId | string | 是 | 对应菜品 ID |
| name | string | 是 | 下单时菜品名称快照 |
| price | number | 是 | 下单时菜品单价快照 |
| quantity | number | 是 | 数量 |
| unit | string | 否 | 单位快照 |
| lineAmount | number | 是 | 该项小计金额 |
| image | string | 否 | 菜品图片快照，当前可选 |
| tag | string | 否 | 菜品标签快照，当前可选 |

## 说明
- `OrderItem` 中必须保留名称、价格等关键快照
- 不应在订单展示时完全依赖实时菜品表
- 后续即使菜品改名、改价、下架，历史订单仍应可正常展示

---

# 7. User（用户）

## 作用
表示顾客身份，当前阶段先做轻量。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 用户唯一标识 |
| displayName | string | 否 | 用户显示名称 |
| nicknameType | string | 否 | 昵称来源类型，如 custom / random |
| avatar | string | 否 | 头像，当前可选 |
| memberLevel | string | 否 | 会员等级，当前预留 |
| status | string | 是 | 用户状态 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- 当前阶段不急于做完整会员体系，但 `User` 模型应先立住
- `displayName` 当前非常重要，因为它和商家叫号、订单展示直接相关
- `memberLevel` 当前预留，不做复杂逻辑

---

# 8. NicknamePoolItem（随机昵称词条）

## 作用
表示随机昵称池中的单个词条，用于生成或提供用户随机昵称。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 词条唯一标识 |
| name | string | 是 | 可供使用的昵称内容 |
| category | string | 否 | 分类，如文艺、可爱、简短 |
| status | string | 是 | 词条状态，见状态约定 |
| sort | number | 否 | 排序值 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- 当前阶段先做简单词条库，不急于做复杂组合式昵称系统
- 后续可支持多词库、组合生成、禁用词条等扩展
- 当前首要目标是：简短、好念、好识别、可维护

---

# 9. Message / Note（留言，轻量预留）

## 作用
表示顾客向店铺留下的轻量内容，当前只做轻量预留。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 留言唯一标识 |
| storeId | string | 是 | 所属店铺 ID |
| userId | string | 否 | 用户 ID |
| customerName | string | 否 | 留言显示名称 |
| content | string | 是 | 留言内容 |
| status | string | 是 | 留言状态 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 说明
- 当前只是轻量预留，不定义复杂评论机制
- 后续若做留言墙、精选留言、审核机制，可继续扩展
- 当前可与订单备注区分开来，不建议混用

---

# 四、当前推荐状态值约定

# 1. Store.status
| 值 | 含义 |
|---|---|
| active | 正常营业中 |
| paused | 暂停营业 |
| closed | 关闭 / 停用 |

---

# 2. Category.status
| 值 | 含义 |
|---|---|
| active | 启用中 |
| hidden | 隐藏 / 不展示 |

---

# 3. Dish.status
| 值 | 含义 |
|---|---|
| active | 在售 |
| sold_out | 售罄 |
| inactive | 下架 |

说明：
- `sold_out` 表示暂时卖完，未来可恢复
- `inactive` 表示商家主动下架，不应在顾客端展示或下单

---

# 4. Order.orderType
| 值 | 含义 |
|---|---|
| dine_in | 堂食 |
| pickup | 自提 |

说明：
- 当前以堂食为主
- `pickup` 先预留，后续再真正落地

---

# 5. Order.status
| 值 | 含义 |
|---|---|
| pending | 待处理 |
| accepted | 已接单 |
| preparing | 制作中 |
| ready | 可取 / 可上菜 |
| completed | 已完成 |
| cancelled | 已取消 |

说明：
- 当前先定义这些基础状态
- 后续如果需要更细粒度状态，应单独讨论，不要随意加

---

# 6. Order.paymentStatus
| 值 | 含义 |
|---|---|
| unpaid | 未支付 |
| paid | 已支付 |
| refunded | 已退款 |
| failed | 支付失败 |

说明：
- 当前阶段可先以 `unpaid` 为主
- 后续接微信支付后再真正驱动状态流转

---

# 7. User.status
| 值 | 含义 |
|---|---|
| active | 正常 |
| disabled | 已禁用 |

---

# 8. NicknamePoolItem.status
| 值 | 含义 |
|---|---|
| active | 可用 |
| inactive | 停用 |

---

# 9. Message.status
| 值 | 含义 |
|---|---|
| pending | 待处理 / 待审核 |
| visible | 可展示 |
| hidden | 隐藏 |

---

# 五、金额字段统一原则

## 1. 当前统一使用 number，单位为元
例如：
- `12`
- `18.5`
- `36`

## 2. 金额字段职责划分
- `price`：单价
- `lineAmount`：订单项小计
- `totalAmount`：商品总金额
- `discountAmount`：优惠金额
- `payableAmount`：实际应支付金额

## 3. 页面不要自己随意定义新金额名
顾客端、商家端、后端都应尽量使用上述统一命名。

---

# 六、当前对象关系

## 1. Store 与 Category
一个店铺可以有多个分类。

## 2. Store 与 Dish
一个店铺可以有多个菜品。

## 3. Category 与 Dish
一个分类可以包含多个菜品，一个菜品属于一个分类。

## 4. User 与 Order
一个用户可以有多个订单，当前阶段允许匿名或轻身份下单，因此 `userId` 可为空。

## 5. Order 与 OrderItem
一个订单包含多个订单项。

## 6. Store 与 Message
一个店铺可以收到多条留言。

## 7. NicknamePoolItem 与 User
昵称池中的词条可用于生成用户显示名称，但不是强绑定关系。

---

# 七、当前阶段建模边界

为了控制复杂度，当前文档明确暂不建模以下内容：

- 复杂菜品规格（大杯/小杯/加料）
- 套餐模型
- 优惠券模型
- 满减活动模型
- 积分模型
- 多门店模型
- 配送地址模型
- 配送费模型
- 后厨打印任务模型
- 多角色权限模型

这些内容不是永远不做，而是当前阶段暂缓。

---

# 八、三端使用规则

## 顾客端
- 使用 Store、Category、Dish 展示菜单
- 使用 CartItem 存储购物车最小结构
- 使用 Order / OrderItem 展示订单
- 不自行发明新的金额字段和订单状态字段

## 商家端
- 使用 Store 维护店铺信息
- 使用 Category、Dish 维护菜单
- 使用 Order 处理订单状态
- 不自行定义另一套菜品状态和订单状态

## 后端
- 接口设计和数据库设计以本文档为统一依据
- 如确需新增字段，应先更新本文档，再同步三端

---

# 九、后续文档依赖关系

本文档完成后，后续应继续产出：

1. `order-state-machine.md`
   - 详细规定订单状态如何流转
   - 顾客端可见状态与商家端可操作状态
   - 支付状态与订单状态之间的关系

2. `api-contracts.md`
   - 规定顾客端、商家端、后端之间的接口输入输出

3. `roles-and-flows.md`
   - 规定顾客、商家在真实业务中的流程

---

# 十、当前结论

本文档定义的是当前阶段三端共享的“最小但可扩展”的统一业务模型。

原则是：
- 先统一语言
- 先统一字段
- 先统一对象边界
- 再进入状态机、接口、数据库和三端实现

如果后续要新增字段或对象，应优先更新本文档，再推进代码实现。