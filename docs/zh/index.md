---
layout: home

hero:
  name: Grok Bot 头像引擎
  text: 客户端的渲染器，跑在客户端之外
  tagline: 26 个身体、挖出来的眼睛、53 个动作状态，还有带梗的南瓜。逐字节移植自 Grok Bot 0.78.1 应用。非官方。
  actions:
    - theme: brand
      text: 开始
      link: /zh/guide/start
    - theme: alt
      text: 接口
      link: /zh/api
    - theme: alt
      text: English
      link: /

features:
  - title: 不是复刻
    details: 渲染器就是应用自己的那些声明，原样从 bundle 里取出，每个符号都记了偏移和 sha1。`renderAvatarSvg` 和 `createAvatar` 把它绑定出来，这两个函数自己一笔都不画。
  - title: 真正的网格轮廓
    details: 旋转、放样、挤出、小球簇，或者一个光线步进的距离场，再投影。大角度偏航是一次转向，不是一次压扁。晶体是并集，云也是。
  - title: 眼睛是洞
    details: 没有任何一笔在画眼睛。网格那条路用 SVG 蒙版把它挖出来，平面那条路把它接进轮廓，两条路透出来的都是页面。
  - title: 整张状态表
    details: 客户端的有状态驱动和片段机：28 条片段上的 53 个状态，带种子的洗牌、眨眼、指针注视，姿态按应用自己的方式量化。
---

## 社区

作者是 [铁柱AGI（X @cgnot996）](https://x.com/cgnot996)。同一桌面客户端的协议库是 [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk)。本机 Grok Build 的桌面工作台是 [Grok App](https://github.com/RongleCat/grok-app)。从头讲 Grok Bot 的课程在[学习站](https://bot.tiezhu.si/)。

<p>
  <img src="/wechat/mp-search-scan.png" alt="微信搜索铁柱AGI" width="420" />
  &nbsp;&nbsp;
  <img src="/wechat/wechat-qr.png" alt="作者微信，用于加入付费社群" width="200" />
</p>

微信搜 **铁柱AGI** 是公众号。右边是作者个人微信。付费社群需要先加上这个微信，再申请加入。
