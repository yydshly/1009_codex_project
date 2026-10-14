# 共享素材与历史记录

本轮的截图、影片、母片、未采用版本与源码都保留。普通路径是共享内容的只读入口；`retention.json` 给出逐文件记录。旧 ZIP 改为同目录的 `.archive.json`；旧材料清单里的 ZIP 校验值表示原始容器，而新导出的 ZIP 保证成员原始内容一致。

在 `F:/codex_project/1009_codex_project/projects/013-xinjiang-knowledge-sandbox` 目录中运行 Python 3.10+：

```sh
python tools/process_store.py save --round round-24 --base round-23 --source web --mount source-recorded
python tools/process_store.py verify
python tools/process_store.py export --round round-23 --output out/round-23.zip
python tools/process_store.py restore --round round-23 --output out/round-23-editable
python tools/process_store.py export --archive round-23/source-and-materials.archive.json --output out/r23-original-members.zip
```

新轮次先放入自己的新截图、视频与检查结果，再用 `save` 冻结实际录制源码。未改变的内容不会重复增加素材数据；冻结轮次不能覆盖。继续开发修改实时 `web/`，不要修改共享历史文件。运行日志写入 `web/.cache/runtime/`，不能写进已冻结的轮次。

完整说明见本项目 `storage/README.md`。备份对象与清单，不要再次复制所有共享查看入口。
