# 数据与审核合同

`content/events/*.md` 保存稳定 ID、日期、精度、领域、组织、来源、事实摘要、影响判断、关联事件与正文。`content/timelines/*.yaml` 只保存专题描述、事件 ID 与本专题入选理由。`sources/catalog/primary.json` 保存一手来源的书目信息。

日期支持年、月、日，必须与精度一致、有效且不晚于研究截点。ID 唯一，所有引用必须存在，事件至少属于一条时间线。HTML 不允许进入事件正文。

`verification: source-checked` 只表示机器辅助核对过来源，不等于人工批准。人工审核在 `content/approvals.json` 中记录事件、审核人、时间、决定与 SHA-256 指纹。指纹覆盖事件正文、来源与时间线入选理由；任一变化会使审核失效并阻断构建，需要撤销旧审核后重新审阅。

维护者审核人配置见 `automation/reviewers.json`。认证身份不等于审核行为；只有维护者实际核实并明确批准后才运行审核命令。自动任务不得生成批准记录。

候选采集状态存储在独立 `automation-state` 分支的 `state.json`，不混入正式事件目录。候选 URL 去重，抓取失败保留原水位，新增候选仅产生人工待办。

事实源与检查入口：[模型约束](../automation/checks/model.mjs)、[内容检查](../automation/checks/content.mjs)。

[返回规格索引](README.md)
