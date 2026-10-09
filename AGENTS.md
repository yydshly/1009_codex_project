# 总库维护约定

本仓库用于研究多个优秀 GitHub 项目。默认使用中文说明，根 README 是对外索引，研究细节放在独立子项目中。

- 项目元数据维护在 `projects.json`；根 README 的 `PROJECT_INDEX` 区块由脚本生成。
- 新增项目使用 `npm run project:new -- --slug ... --title ... --source ... --summary ...`，按收录顺序分配 `001` 起的编号。已有编号不要改动或复用；归档保留记录。
- 子项目目录固定为 `projects/编号-slug/`，至少包含 `README.md`、`research.md`、`assets/` 和 `web/README.md`。
- 收录时保留原仓库链接；研究时记录 tag 或 commit、运行环境、上游许可证与结论依据。实际引入上游代码时保留其 LICENSE 和版权声明。
- 预览图放在子项目 `assets/` 中，补充图片说明。占位图应明确标注，不能描述成已验证的项目界面。
- 各子项目自行管理依赖与技术栈。仅用于本地阅读的上游克隆可以放在被忽略的 `upstream/` 中。
- 修改摘要、状态、图片或演示配置后运行 `npm run index:sync` 和 `npm run check`。
- 多 Web 通过统一 Pages 站点的编号子路径展示。设置 `pagesDir` 时同步更新构建工作流，构建产物必须包含 `index.html`；验证发布汇总时运行 `npm run pages:build`。
- 根脚本使用 Node.js 22+ 标准库，无需根级依赖。构建产物与真实凭据不提交。
