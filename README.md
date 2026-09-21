# AI Chronicle · AI 大事记

An open chronicle of AI milestones, with a curated main timeline, complementary topic timelines, and verifiable sources.

当一项新技术出现时，回看它从哪里来、经历了哪些关键转折，以及它与其他事件有什么关系。

AI Chronicle 面向 AI 从业者，记录值得长期回看的行业事件。项目作为 [The Untold](https://theuntold.ai) 旗下独立子站发布。

[在线站点](https://maxzyma.github.io/aichronicle/) · [首批审核包](research/reviews/initial-review.md) · [验收记录](docs/validation.md)

## 主线与专题

- **主时间线**：精选影响 AI 能力、成本、普及、产业格局或治理的重要节点，帮助读者把握行业演进。
- **专题时间线**：按技术、组织、产品或应用等维度追溯发展；专题中的细节不必全部进入主线。
- **共享事件**：同一事件只有一份事实记录，可被多条时间线引用；专题补充各自的阅读语境。
- **回顾与派生**：年度回顾、技术沿革与专题文章从事件记录派生，保留到事件和来源的链接。

## 内容如何进入公开记录

自动化发现候选，人工核实来源、日期与事实，并判断适合进入哪条时间线。只有经过人工审核的事件才进入正式记录。事实、影响判断和后续发展分别记录，允许有据可查的修订。

完整规则见[编辑规范](specs/editorial.md)。

## 仓库导航

- [规格设计](specs/README.md)
- [原始素材与出处](sources/README.md)
- [研究与总结](research/README.md)
- [事件与时间线](content/README.md)
- [自动化](automation/README.md)
- [站点源码](site/README.md)
- [运行、审核与发布](docs/runbook.md)

## 参与与建设

建设按[实施计划](docs/implementation-plan.md)推进，覆盖目录结构、素材接入、首轮研究、静态站点与持续自动化；当前阶段见[路线图](docs/roadmap.md)。

- 提议事件、纠正事实、补充来源：[贡献指南](CONTRIBUTING.md)
- 准备事件内容：[事件模板](templates/event.md)
- 提交候选或纠错：[GitHub Issues](https://github.com/maxzyma/aichronicle/issues)
- 检查本地文档入口与相对链接：`python3 tools/check_docs.py`

## 许可

原创内容与事件数据采用 [CC BY 4.0](LICENSE-CONTENT.md)；代码与工具采用 [MIT](LICENSE)。第三方引文、图片和其他材料按其原有许可使用，不因被引用而重新授权。
