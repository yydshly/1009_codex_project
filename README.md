# GitHub 项目研究索引

记录最近遇到的优秀 GitHub 项目：为什么值得研究、如何运行、实现原理，以及基于研究制作的 Web 演示。

这是多个子项目的总入口。每个子项目拥有固定编号、独立研究文档与图片资源；需要展示时，可在同一个 GitHub Pages 站点下发布独立路径。

[收录与研究指南](docs/project-guide.md) · [Web 发布指南](docs/deployment.md) · [子项目目录](projects/) · [项目模板](templates/project/)

## 有序索引

编号按收录先后分配，从 `001` 开始，目录采用 `001-project-name`。已有编号保持不变，归档后保留索引，新增项目使用下一个编号。

<!-- PROJECT_INDEX:START -->
暂未收录子项目。使用下方命令创建第一个研究项目，编号将从 `001` 开始。
<!-- PROJECT_INDEX:END -->

## 开始一个子项目

需要 Node.js 22 或更高版本；总库脚本不依赖第三方包，无需安装依赖。

```sh
npm run project:new -- --slug example-repo --title "项目名称" --source "https://github.com/owner/repo" --summary "一句话说明研究价值" --tags "工具,Web"
```

命令会分配下一个编号，建立研究目录，并更新上面的索引与图片卡片。`example-repo` 是命令示例，当前尚未收录实际项目。

随后填写子项目的 `README.md` 和 `research.md`，用实际截图替换 `assets/preview.svg`；修改 `projects.json` 中的摘要、状态或图片后执行：

```sh
npm run index:sync
npm run check
```

## 仓库布局

```text
.
├── README.md                 # 对外入口：有序索引、摘要、预览图
├── projects.json             # 项目元数据，索引的唯一数据源
├── projects/                 # 001-xxx、002-xxx 等独立子项目
├── templates/project/        # README、研究记录、图片与 Web 模板
├── docs/                     # 收录规则与多 Web 发布说明
├── scripts/repo.mjs          # 新建项目、同步索引、校验、汇总站点
└── .github/workflows/        # 自动校验与手动 Pages 发布
```

## 研究与展示约定

- **总入口保持简洁**：根 README 放索引、研究价值和预览图，详细结论放在各子项目内。
- **记录可复现信息**：保留原仓库链接、研究时的版本或 commit、环境、运行步骤和结论依据。
- **图片就近维护**：放在对应子项目的 `assets/`，补充图片说明，优先使用实际界面截图或结构图。
- **子项目独立运行**：依赖、源码和运行方式由各子项目自行管理，总库不限定技术栈。
- **保留上游归属**：引入上游代码时保留其 LICENSE 和版权声明，在子项目中注明来源与修改范围。

初始化日期：2026-10-09。Web 发布流程已预留，待有演示内容时按[发布指南](docs/deployment.md)启用。
