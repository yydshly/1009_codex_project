# 蓝图画面本地预览

来源：Lemomo / LemoLab 的 `styles/blueprint/demo/`，固定版本见 `import-manifest.json`。

原作 `main.js`、`draw.js`、`film.js`、`machine.js`、`paper.js`、`sheet.js`、台词与时长数据保持原样。字体由原作 CREDITS 指向的 Google Fonts 仓库补齐，保留独立 OFL 版权与许可；导入清单保存地址、文件大小与 SHA-256。

本地新增 `index.html` 与 `player.js`：在 iframe 内调用原作 `render(t)`，增加播放、暂停和时间定位。绘制坐标仍是1920×1080，预览合成视口为960×540，最多每秒更新12次；实际帧率取决于GPU。默认从第8秒展示完整绘制画面，阶段按钮和进度条可查看前后内容。

没有复制视频或音轨，也未执行原作的安装、配音或成片导出脚本。本地为静音画面预览，完整声音由正文中的上游MP4播放器提供。

原作许可与归属见 `LICENSE`、`CREDITS`、`fonts/OFL*.txt`。此处是研究与展示用途。
