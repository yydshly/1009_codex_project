# 收录与研究指南

## 编号与目录

项目编号是永久索引，按收录顺序递增。`001`、`002`、`003` 同时用于根 README 顺序、子项目目录和 Web 演示路径。不要为调整展示顺序重命名已有编号；暂时停止研究的项目使用 `archived` 状态保留记录。

创建项目：

```sh
npm run project:new -- --slug example-repo --title "项目名称" --source "https://github.com/owner/repo" --summary "为什么值得研究" --tags "AI,Web"
```

`slug` 使用小写英文、数字和短横线。编号自动分配，无需手工填写。创建命令不会下载上游代码，也不会安装子项目依赖。

```text
projects/001-example-repo/
├── README.md           # 简介、上游链接、截图、运行与研究入口
├── research.md         # 问题、版本、架构、实验、发现与后续计划
├── assets/
│   ├── preview.svg     # 索引预览图；替换为实际截图时更新元数据
│   └── README.md       # 图片来源、内容说明与命名约定
└── web/
    └── README.md       # 演示实现、构建命令、输出目录与路由说明
```

源码可以按实际需要放到 `src/`、`web/` 或其他子目录。只查看上游代码时，可克隆到被忽略的 `upstream/`；需要纳入总库的代码必须保留上游许可和来源说明。

## 元数据

`projects.json` 是索引的唯一数据源；根 README 两个 `PROJECT_INDEX` 标记之间的内容由脚本生成，不要手工修改。数组中的记录会按 `id` 数值排序，数组位置不会改变展示顺序。

| 字段 | 含义 |
| --- | --- |
| `id` | 三位数字编号，创建后固定 |
| `slug` | 简短目录名，组合成 `id-slug` |
| `title` / `summary` | 项目名称 / 一句话研究价值 |
| `summarySections` | 可选，按 `{ "label": "能力", "text": "说明" }` 分项填写；仅根 README 索引表的摘要使用加粗标签与单元格换行 |
| `entryOverview` | 可选，`shortName` 简称、`capability` 原库／参考作品能力、`research` 我们实际研究与实验、`value` 借鉴意义；生成索引表上方与网页首页的简洁概览 |
| `source` / `sourceRef` | 原 GitHub 仓库 / 研究时的 tag 或 commit |
| `status` | `queued` 待研究、`researching` 研究中、`prototyping` 复现中、`done` 已完成、`archived` 已归档 |
| `tags` | 技术或主题标签数组 |
| `addedAt` | 收录日期，`YYYY-MM-DD` |
| `preview` / `previewCaption` | 相对子项目目录的图片路径 / 图片说明 |
| `demoUrl` | 明确指定的演示 HTTPS 地址，可指外部演示或编号下的具体页面；优先使用，留空时采用本地编号目录首页 |
| `pagesDir` | 相对子项目目录的静态发布目录；不发布时为 `null` |

图片建议使用 16:9 比例，名称使用小写英文，例如 `preview.png`、`architecture.svg`。初始 `preview.svg` 只是占位图，不能作为已实现界面的证据。

入口概览每项用一句话串联“能力 → 研究 → 意义”，每个字段尽量15–40字；区分源码拆解、说明页、实际实验和完整复跑，不把后续设想写成已有能力。修改`entryOverview`后运行`npm run index:sync`与`npm run check`；网页概览由`npm run pages:build`读取同一份元数据生成。

## 一次完整研究

1. 收录项目，填写为什么值得研究和重点问题。
2. 确定研究版本，记录环境与最小运行步骤。
3. 阅读关键源码，记录架构、数据流和有依据的结论。
4. 完成复现或实验，加入截图、结果和已知限制。
5. 需要 Web 演示时，按[发布指南](deployment.md)接入。
6. 更新摘要、状态和预览图，运行 `npm run index:sync` 与 `npm run check`。

`check` 会检查编号、元数据、项目目录、图片文件与索引是否一致；启用 Pages 的项目还需要存在静态入口 `index.html`。研究内容的真实性与子项目功能测试由对应项目负责。
