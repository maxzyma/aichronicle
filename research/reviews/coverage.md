# 行业覆盖检查

面向维护者，用于决定下一轮搜什么、哪些候选需要回溯。覆盖单位是技术问题与事件阶段，不是厂商名单；出现代表事件只说明已有入口，不代表该方向覆盖完成。

## 检查基线

2026-09-21，HEAD `62403758947a7d78b159be244b3ec998e94d5d6d` 加本次工作树变更。范围为全部事件、两条时间线、来源目录及手写素材对照；下表是编辑抽查与后续研究队列，不是量化完整率。后续验收必须重新取基线。

## 主线与专题的覆盖地图

| 方向 | 已有查阅入口 | 下一步核查对象与问题 |
| --- | --- | --- |
| 模型能力与训练 | [Transformer](../../content/events/transformer.md)、[DeepSeek R1](../../content/events/deepseekr1.md) | 推理训练、蒸馏、小模型、多模态与中国及其他地区开放模型；权重可得和许可限制分别核实。 |
| 计算、成本与可及性 | [规模定律](../../content/events/scaling-laws.md) | 推理成本、量化、端侧部署、芯片与算力供给；公开价格不能直接当成总使用成本。 |
| 知识与长期记忆 | [RAG](../../content/events/rag.md)、[GraphRAG](../../content/events/graphrag.md)、[MemGPT](../../content/events/memgpt.md) | 检索、知识整理、状态记忆分别查；补 GraphRAG 开源节点与记忆评测，避免只收术语文章。 |
| 执行与协作 | [AutoGen](../../content/events/autogen.md)、[LangGraph](../../content/events/langgraph.md)、[Graph Engineering](../../content/events/graph-engineering.md)及[综述](../../content/events/graph-engineering-survey.md) | AutoGPT、BabyAGI、CrewAI、规划与执行恢复；追溯原始发布，不把 2026 年术语热度当成图执行起源。 |
| 反馈与运行环境 | [Reflexion](../../content/events/reflexion.md)、[ACE](../../content/events/agentic-context-engineering.md)、[Harness](../../content/events/harness-engineering.md)、[Loop](../../content/events/loop-engineering.md) | 隔离、权限、停止条件、重试与运行时学习；区分工程职责与模型权重更新。 |
| 工具、协议与生态 | [函数调用](../../content/events/function-calling.md)、[MCP](../../content/events/mcp.md)、[A2A](../../content/events/a2a.md)、[Skills](../../content/events/agent-skills.md) | 发布、开放规范、基金会治理、跨平台采用分别查；早期 API 与协议后续阶段待补。 |
| 产品与实际采用 | [Claude Code](../../content/events/claude-code.md)、[OpenClaw](../../content/events/openclaw-public.md)、[Manus](../../content/events/manus-retrospective.md) | Cursor、非编程工作流、浏览器与个人 Agent；产品起点、开放、采用、失败或退场分别查。 |
| 评测与可靠性 | [SWE-bench](../../content/events/swe-bench.md)、[AgentDojo](../../content/events/agentdojo.md) | WebArena、OSWorld、GAIA、真实部署评测；基准版本、泄漏、任务成功和对抗鲁棒性不能混成一个分数。 |
| 科学、视觉、语音与具身 | [AlphaGo](../../content/events/alphago.md)，其余从[事件索引](../../content/README.md)复核 | 科学发现、图像视频生成、实时语音、机器人分别检查；Agent 专题不能代替整个 AI 行业。 |
| 治理与产业变化 | [事件索引](../../content/README.md)中的治理候选 | 法规实施、许可变化、版权判决、安全事件和组织变化；需用同期原文区分提案、通过、实施和影响。 |

这些对象是待核查线索，不是已确认发生的里程碑。历史阶段还须覆盖专家系统、统计学习和早期强化学习；地区检查包括中国、北美、欧洲及其他地区，不能用英文来源数量代表全球覆盖。

## 每周执行

1. 编辑逐行写出本周结论：新增证据、未发现可收录事件、仍有缺口、暂不收录及理由。未检索不能写“没有事件”。记录检索日期、原始链接和下一步，更新对应事件或[缺口清单](gaps.md)。
2. 对新热点回溯前身、平行路线和反例；查同一方法的旧名称与同一名称的不同含义。首创、命名传播、研究、预览、正式可用、采用和退场不得合并为单一日期。
3. 对照上述方向，额外搜索订阅源之外的论文、项目发布记录和地方语言来源；对分页截断及无 RSS 的源完成补查。每周至少优先处理一个尚无代表记录的方向，未完成则保留明确缺口。
4. 复核主线与专题归属、来源独立性、地域和机构偏重，删除失效或重复断言。没有证据的新术语保留线索，不能为了填格子创建事件。
5. 在周报记录完成与未完成项，再由人工判断候选是否发布。自动生成检查清单不等于完成研究；事件数量、测试通过与采集成功均不能证明行业覆盖完整。

## 近期优先队列

1. 框架与产品前史：AutoGPT、BabyAGI、Cursor、Manus 最初公开节点。
2. 评测与失效：WebArena、OSWorld、GAIA、提示注入与长期任务失败的原始研究。
3. 全球主线：开放模型、推理成本、视频／语音、具身与科学应用，先补区域与方向空白，再决定是否派生新专题。

[返回研究索引](../README.md) · [编辑规范](../../specs/editorial.md)
