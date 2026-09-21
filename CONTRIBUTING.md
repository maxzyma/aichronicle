# 参与 AI Chronicle

欢迎补充事件、修正日期与事实、提供更可靠的来源，以及提出时间线的组织建议。项目范围见 [README](README.md)，入选与核实要求见[编辑规范](docs/editorial.md)。

## 提议事件

1. 搜索已有 Issue 和事件，避免重复。
2. 按[事件模板](templates/event.md)整理发生时间、事实摘要、来源、入选理由与关联事件。
3. 创建 Issue；有自动化工具协助时，注明哪些内容尚未核实。
4. 维护者人工核实后决定收录、补充材料或暂缓。候选提交不等于正式收录。

## 纠正记录

指出具体条目与待修正的表述，附支持修正的来源。原地修正错误事实；通过 Git 提交保留修订历史。后续出现的新证据与事态发展，应标明其发生时间，避免把后来的认知写成当时已经知道的事实。

## 提交改动

- 用一个 Pull Request 处理一个相关主题，说明修改内容和依据。
- Commit message 使用英文 Conventional Commits，例如 `docs: clarify milestone selection criteria`。
- 文档、模板的新增或移动必须同步 README 或其下级入口，并运行 `python3 tools/check_docs.py`。
- 贡献前确认拥有发布权限。不要提交密钥、非公开材料或未经许可转载的全文。

提交原创内容与数据即表示同意按 [CC BY 4.0](LICENSE-CONTENT.md) 提供该贡献；代码与工具贡献按 [MIT](LICENSE) 提供。保留第三方材料的来源和许可说明。
