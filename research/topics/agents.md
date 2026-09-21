# Agent 演进：能力如何组合成系统

状态：首轮研究草稿，待人工核实。研究截点见[批次信息](../reviews/batch.json)。[专题成员](../../content/timelines/agents.yaml)引用统一事件记录，不单独复制事件日期。

## 推理与行动

[思维链](../../content/events/chain-of-thought.md)与[ReAct](../../content/events/react.md)分别提供中间推理与推理—行动组织的观察入口。[Reflexion](../../content/events/reflexion.md)把语言反馈引入后续尝试。这些机制不保证任务成功，评估必须区分单步回答与长程执行。

## 工具与互操作

[函数调用](../../content/events/function-calling.md)降低结构化动作接口的使用成本；[MCP](../../content/events/mcp.md)连接应用与工具、数据；[A2A](../../content/events/a2a.md)面向 Agent 之间的协作。协议发布、跨平台支持、生产采用与治理迁移是不同事件。[MCP 基金会迁移](../../content/events/mcp-foundation.md)属于治理与生态变化。

## 上下文与执行环境

[RAG](../../content/events/rag.md)提供外部知识入口，[上下文工程](../../content/events/context-engineering.md)关注任务过程中有限输入的信息组织。[Skills](../../content/events/agent-skills.md)封装工作方法，[Harness 实践](../../content/events/harness-engineering.md)讨论模型周围的约束、反馈和执行环境。它们可以组合，不应画成相互淘汰的单线技术史。

## 从研究到产品

[computer use](../../content/events/computer-use.md)扩大行动界面，[Claude Code](../../content/events/claude-code.md)把编程任务组织为持续工具循环，[Responses API](../../content/events/responses-api.md)与[Agent SDK](../../content/events/claude-agent-sdk.md)提供应用开发组件。厂商介绍可证明其发布动作，效果与普及度还需要独立证据。

## 产品起点与采用信号

[OpenClaw 项目起点](../../content/events/openclaw-origin.md)与[公开平台公告](../../content/events/openclaw-public.md)分开，保留名称沿革但不将更名本身当作行业突破。[Claude Code 预览](../../content/events/claude-code.md)、[正式可用](../../content/events/claude-code-ga.md)与[厂商披露的收入运行率](../../content/events/claude-code-adoption.md)分别回答能否试用、是否开放和出现了什么采用信号。[Manus 回顾](../../content/events/manus-retrospective.md)提供编程之外的产品实践，厂商案例不等于独立效果验证。

## 反馈、知识与持续执行

[ACE](../../content/events/agentic-context-engineering.md)讨论利用反馈整理上下文；[LLM Wiki](../../content/events/llm-wiki.md)描述可维护知识层；[OKF](../../content/events/open-knowledge-format.md)提供交换知识的格式约定；[Loop Engineering](../../content/events/loop-engineering.md)讨论由外部系统持续分配任务与检查结果。它们承担不同职责，不能仅凭发布时间推导替代关系。模型可以选择工具及参数，执行、权限和验证仍由应用承担。

## 新路线观察

[Jev](../../content/events/jev.md)已进入专题候选，观察结构化概率决策在 Agent 控制与路由中的用途。发布事实可以核实，但厂商的速度、成本与无幻觉宣称尚未成为独立验证结论；暂不凭热度进入主线。

## 当前判断

Agent 的差异不仅由模型决定，还由任务分解、工具权限、上下文、反馈、停止条件与评估共同决定。这是编辑归纳，不是已经证实的单一因果定律。主时间线只保留其中足以改变行业实践的节点，专题保留帮助理解来路的论文与经验文章。

素材入口：[素材逐节对照](../../sources/excerpts/agent-notes-coverage.md)及[手写时间线公开整理稿](../../sources/excerpts/agent-notes.md)。待补证据见[研究缺口](../reviews/gaps.md)。

[返回研究索引](../README.md)
