# 多项目一致性约束

## 文档目的
本文档用于约束顾客端、未来商家端、未来后端如何长期保持一致，避免出现三端各自定义字段、状态和金额语言的问题。

它负责的是协作规则和修改顺序，不负责描述单个项目当前阶段的细节。

## 一、哪些文档是三端共享文档
当前三端长期共享的基础文档包括：

1. [`AGENTS.md`](/E:/OrderEz/AGENTS.md)
2. [`data-models.md`](/E:/OrderEz/data-models.md)
3. [`technical-path.md`](/E:/OrderEz/docs/architecture/technical-path.md)
4. [`order-state-machine.md`](/E:/OrderEz/docs/contracts/order-state-machine.md)
5. [`api-contracts.md`](/E:/OrderEz/docs/contracts/api-contracts.md)
6. 本文档

它们分别负责：

- `AGENTS.md`：项目阶段目标、开发边界、实现原则
- `data-models.md`：统一对象、字段、状态、金额定义
- `technical-path.md`：系统拆分方式、项目关系、开发顺序
- `order-state-machine.md`：订单与支付状态流转
- `api-contracts.md`：接口输入输出结构
- 本文档：三端协作顺序和一致性约束

## 二、哪些文档是项目独立文档
项目独立文档只服务某一个项目当前阶段，不属于三端长期共享契约。

当前顾客端独立文档是：

- [`current-client-alignment.md`](/E:/OrderEz/docs/customer/current-client-alignment.md)

它只用于说明当前顾客端已经做到什么、还差什么、下一轮适合怎么小步收口，不应被当作商家端或后端的长期共享契约替代品。

## 三、一致性靠什么维护
三端一致性不能靠口头约定，必须靠明确文档和固定修改顺序维护。

最核心的原则是：

1. 共享模型先于实现
2. 共享状态机先于状态流转代码
3. 共享接口契约先于前后端联调
4. 项目独立分析文档只负责说明当前偏差，不负责发明新的共享语言

## 四、新增字段、新增状态、新增对象时的修改顺序
后续任何一端，只要新增下面这些内容：

- 新字段
- 新状态值
- 新金额字段
- 新业务对象

都必须按这个顺序处理：

1. 先更新 `data-models.md`
2. 再更新相关共享文档
3. 再确定顾客端、商家端、后端各自要改哪些位置
4. 最后再改代码

不允许的顺序包括：

- 先改顾客端代码，再补共享文档
- 商家端先发明字段名，再要求后端适配
- 后端先定一版接口，再让前端跟着猜

## 五、三端不得各自发明字段名、状态名、金额字段名

### 1. 不得各自发明字段别名
例如不能出现：

- 顾客端：`intro`
- 商家端：`storeDesc`
- 后端：`description`

如果确实需要展示层别名，也必须明确：

- 哪个是业务主字段
- 哪个只是页面派生字段

### 2. 不得各自发明状态值
例如不能出现：

- 顾客端：`on`
- 商家端：`selling`
- 后端：`active`

状态值必须统一来自 `data-models.md` 和 `order-state-machine.md`。

### 3. 不得各自定义金额字段
例如不能出现：

- 顾客端：`bottomPrice`
- 商家端：`saleAmount`
- 后端：`payMoney`

金额字段必须优先使用统一命名：

- `price`
- `lineAmount`
- `totalAmount`
- `discountAmount`
- `payableAmount`

## 六、后续使用 Codex 时应先读哪些文档

### 顾客端任务
至少先读：

1. [`AGENTS.md`](/E:/OrderEz/AGENTS.md)
2. [`data-models.md`](/E:/OrderEz/data-models.md)
3. [`technical-path.md`](/E:/OrderEz/docs/architecture/technical-path.md)
4. [`order-state-machine.md`](/E:/OrderEz/docs/contracts/order-state-machine.md)
5. [`api-contracts.md`](/E:/OrderEz/docs/contracts/api-contracts.md)
6. [`current-client-alignment.md`](/E:/OrderEz/docs/customer/current-client-alignment.md)

### 商家端任务
至少先读：

1. 商家端项目自己的 `AGENTS.md`
2. [`data-models.md`](/E:/OrderEz/data-models.md)
3. [`technical-path.md`](/E:/OrderEz/docs/architecture/technical-path.md)
4. [`order-state-machine.md`](/E:/OrderEz/docs/contracts/order-state-machine.md)
5. [`api-contracts.md`](/E:/OrderEz/docs/contracts/api-contracts.md)
6. 本文档

### 后端任务
至少先读：

1. 后端项目自己的 `AGENTS.md`
2. [`data-models.md`](/E:/OrderEz/data-models.md)
3. [`technical-path.md`](/E:/OrderEz/docs/architecture/technical-path.md)
4. [`order-state-machine.md`](/E:/OrderEz/docs/contracts/order-state-machine.md)
5. [`api-contracts.md`](/E:/OrderEz/docs/contracts/api-contracts.md)
6. 本文档

## 七、如何减少“三套语言分裂”

### 1. 统一模型先于实现
任何真实业务字段，都应先在统一模型里出现，再进入代码。

### 2. 页面用展示映射，不改业务字段
例如状态显示自然中文时，推荐做法是：

- 数据层使用统一英文状态值
- 页面层做中文映射

而不是把业务主数据直接写成中文。

### 3. 各端复用同一组业务语言
即使顾客端、商家端是两个独立小程序代码库，也应保证：

- `Store` 是同一个 `Store`
- `Dish` 是同一个 `Dish`
- `Order` 是同一个 `Order`

共享的是业务定义，不是代码文件。

### 4. 后端接口尽量贴近统一模型
后端不应为了迎合单个页面而输出过度定制字段。

如果某页面需要额外展示字段，应优先考虑：

- 在前端派生
- 或在接口层明确注明是展示字段，而不是替换核心字段

## 八、推荐的文档目录组织方式
推荐逐步形成这样的共享文档结构：

```text
shared-docs/
  AGENTS.md
  data-models.md
  docs/
    architecture/
      technical-path.md
      multi-project-consistency.md
    contracts/
      order-state-machine.md
      api-contracts.md
    customer/
      current-client-alignment.md
```

其中：

- `architecture/` 放长期共享的架构路径与协作规则
- `contracts/` 放长期共享的模型、状态机和接口契约
- `customer/` 放当前顾客端独立分析文档

## 九、推荐的开发顺序与协作方式

### 推荐顺序
1. 统一模型
2. 统一技术路径
3. 统一状态机和接口契约
4. 分析当前顾客端对齐情况
5. 启动商家端独立项目
6. 启动后端并定义接口
7. 分阶段替换 mock

### 协作方式
- 产品或业务变更先落共享文档
- 字段和状态变更先落模型与契约
- 再拆成顾客端、商家端、后端三个执行任务

## 十、当前结论
三端一致性要真正落地，关键不是“大家都知道差不多是什么意思”，而是：

- 共享模型有文档
- 状态机有文档
- 接口契约有文档
- 当前偏差有项目级分析文档
- 修改顺序有明确规则

从现在开始，后续任何涉及真实业务模型的开发任务，都应默认遵守这个顺序：

1. 先读 `AGENTS.md`
2. 先读 `data-models.md`
3. 再读架构文档和契约文档
4. 最后再进入代码实现
