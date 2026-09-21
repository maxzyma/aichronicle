# 自动化

- [来源配置](feeds.json)与[人工巡检入口](watchlist.json)
- [采集器](collectors/feeds.mjs)：RSS/Atom，URL 去重、失败保留水位、持久状态。
- [内容检查](checks/content.mjs)与[模型约束](checks/model.mjs)
- [事件审核包生成](pipeline/review-report.mjs)与[每日／每周候选报告](pipeline/candidate-report.mjs)
- [人工审核命令](pipeline/approve.mjs)与[维护者名单](reviewers.json)
- [运维手册](../docs/runbook.md)

事实源为配置与代码；生成报告和站点不手改。采集候选持久保存在独立分支；运行日志和报告通过 Actions 制品查阅。任何候选不经过人工核实不得进入正式站点。

[返回首页](../README.md)
