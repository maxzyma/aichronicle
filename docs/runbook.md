# 运维手册

Node.js 22.12+，执行 `npm ci` 安装锁定依赖。默认从仓库根目录运行命令。

## 本地与检查

- `npm run check`：文档可达性、相对链接与内容合同。
- `npm test`：审核失效、日期与采集失败恢复等测试。
- `npm run build`：正式站点，输出 `site/dist/`。
- `npm run build:review`：候选预览，输出 `site/review-dist/`。
- `REVIEW_PREVIEW=1 npm run preview -- --port 4321`：在回环地址预览候选，路径 `/aichronicle/`。
- `npm run review:report`：重建[首批审核包](../research/reviews/initial-review.md)。

## 人工审核与发布

维护者逐项核对原始出处、日期精度、事实摘要、影响判断和入选时间线。批准指定条目后，运行 `npm run approve -- --ids react,mcp`。命令以 `gh api user` 验证维护者身份；不要使用 CI 或机器人代审。审核内容指纹变化后检查会失败：先撤回受影响审核，修改记录并重新核实，再批准新指纹。

推送事件与审核记录到 main 后，Checks 验证，Pages 工作流生成正式静态站点。未批准事件没有公开站点路由。GitHub 仓库本身保留待审材料，任何人可以检查与纠错。

## 候选采集

`npm run collect` 默认在 `.runtime/state.json` 保存状态。可用 `STATE_FILE` 指定持久文件。工作流使用独立 `automation-state` 分支保存水位与候选；每日／每周报告作为 GitHub Actions 制品下载。失败源在状态和报告中保留错误，下一轮重试，不误报“没有新事件”。

修改 `automation/feeds.json` 或 `automation/discovery.json` 后先本地试运行。GitHub 搜索在 Actions 中使用内置 `GITHUB_TOKEN`，只发送到 GitHub API；本地可匿名运行但额度较低。公开搜索不读取私有仓库。报告显示结果截断时需要人工扩大或细分检索，不把部分结果当作完整覆盖。新增来源必须是 HTTPS 公共来源，配置允许的主机，避免采集身份、内部链接或第三方全文。人工巡检入口见 [watchlist](../automation/watchlist.json)。

首次启用先创建只含 `state.json` 的 `automation-state` 分支。使用仓库 Actions 的 Candidates 工作流可手动运行采集；定时运行允许延迟，不能声称精确准点。

## 域名与恢复

默认站点为 `https://maxzyma.github.io/aichronicle/`。独立域名上线时设置 Actions 变量 `SITE_URL=https://aichronicle.theuntold.ai`、`SITE_BASE=/`，在 DNS 中创建 `CNAME aichronicle → maxzyma.github.io`（不带仓库路径，先使用 DNS only），再配置 GitHub Pages 自定义域名并检查 HTTPS、资源路径与事件深链接。未配置前继续使用默认 Pages 地址。DNS 修改需要区域的 DNS Write 权限；普通 Wrangler 的部署权限不等于 DNS 写权限。参考 [GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

发布失败先查看 Actions 构建／部署日志，修复后重新运行；内容回退以新提交撤回对应审核，保留 Git 历史。采集状态损坏可从 `automation-state` 上一提交恢复，不能清空水位冒充正常运行。

[返回首页](../README.md)
