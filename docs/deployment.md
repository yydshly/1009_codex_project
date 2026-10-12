# 多个 Web 演示的发布

GitHub Pages 每个仓库对应一个站点，因此本总库把多个静态演示汇总到一个站点的不同路径：

```text
https://yydshly.github.io/1009_codex_project/                  # 项目导航
https://yydshly.github.io/1009_codex_project/001-example-repo/ # 第一个演示
https://yydshly.github.io/1009_codex_project/002-another-repo/ # 第二个演示
```

以上编号路径是示例。本站采用 GitHub Actions 发布，已接入项目见[总索引](../README.md#有序索引)，Agenvo 研究页路径为 [`016-agenvo/`](https://yydshly.github.io/1009_codex_project/016-agenvo/)。GitHub Pages 托管 HTML、CSS、JavaScript 等静态文件；需要常驻后端的项目应将后端另行部署，并在 `demoUrl` 中记录演示地址。

## 接入一个子项目

1. 在子项目中实现 Web 演示，明确依赖与构建步骤。
2. 对于纯静态 HTML，可直接把发布文件放到 `web/`，将 `pagesDir` 设为 `"web"`。对于需构建的应用，可输出到 `web/dist/`，将 `pagesDir` 设为 `"web/dist"`。
3. 在 `.github/workflows/pages.yml` 的“构建子项目”注释处加入这个项目的构建步骤。各项目在自身目录安装与构建，总库不自动执行任意项目命令。
4. 配置项目的资源基础路径，例如 `/1009_codex_project/001-example-repo/`。Vite 应设置对应 `base`；路由可使用 hash 路由，或提供该静态路径下真实存在的 HTML。不要依赖服务器回退路由。
5. 在项目 README 中填写启动、构建与发布说明，然后运行校验和汇总：

```sh
npm run index:sync
npm run check
npm run pages:build
```

汇总结果输出到忽略提交的 `_site/`。导航只链接已配置的 Pages 演示或外部 `demoUrl`，所有项目仍保留研究文档入口。脚本仅复制配置的发布目录，不会复制整个源码仓库；发布目录应只包含预期公开的静态文件。

如果构建产物被 Git 忽略，`npm run check` 与 CI 也需要先构建。新增此类项目后，在 `validate.yml` 的校验步骤之前加入同样的构建步骤。

## 首次启用 Pages

1. 打开仓库的 **Settings → Pages**，在 **Build and deployment → Source** 中选择 **GitHub Actions**。
2. 提交项目和构建配置后，打开 **Actions → Publish GitHub Pages → Run workflow**，选择 `main`。
3. 工作流会校验项目、构建统一导航、上传静态文件，并发布到 `github-pages` 环境。
4. 发布成功后，将实际访问地址补充到子项目 README。

初始化工作流只接受手动触发。将来希望推送后自动发布时，可在 `pages.yml` 中增加 `push: branches: [main]` 触发配置。

参考：[GitHub Pages 类型与限制](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
