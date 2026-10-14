# 过程素材的共享存储与增量记录

## 阶段归档与 Git 保存范围

2026-10-14，当前运行基线为 R90，归档与反思记录为 R91。Git 保存实时源码、运行素材、反思与逐轮 README/retention.json；项目 .gitignore 将历史源码视图、母片、候选版本及存储整理载荷留在本机共享库。忽略规则只影响 Git 收录，没有移除已有素材。

本机恢复使用 process_store.py 和 process/.store/；异机完整恢复还需共享对象库与对应清单。Git 中的逐轮校验清单是索引，不包含清单所指的所有对象。原视频与历史大影片继续使用本机链接，不随源码提交；网页在影片不可用时提供原帖和交互入口。Three.js 依赖按 web/README.md 安装后构建。

下一阶段编辑实时 web/ 或独立恢复目录，用新轮次 save 增量冻结。不要在已有 source-recorded 或共享素材路径上修改；仅在独立交付确有需要时 export。[阶段反思](../web/public/assets/records/stage-retrospective.md)说明后续设计顺序。

同一内容按 SHA-256 只保留一份。每轮的截图、完整影片、母片、未采用版本、声音素材、源码快照和检查记录继续保留；内容不同的版本不会因文件名相同而合并。过程目录中的普通素材路径仍可直接打开。

## 从哪里看

- [R40 事件空间变化、地点进入与人物回应验收](../process/round-40/README.md)

- [R39 地球、事件、地点与模型联动验收](../process/round-39/README.md)

- [R38 地图、主题入口、图鉴与实际操作验收](../process/round-38/README.md)

- [R34 平台蓝图、观察任务、网页验证与增量源码](../process/round-34/README.md)
- [R33 原视频的平台能力观察与证据](../process/round-33/README.md)
- [当前 R32 可控制工作台的截图、验证与增量源码](../process/round-32/README.md)
- [历史 R31 完整声画影片](../process/round-31/recordings/xinjiang-spatial-story-r31.mp4)
- [R31 过程与母片恢复记录](../process/round-31/README.md)
- [R23 过程记录](../process/round-23/README.md)
- [R23 完整轮次清单](../process/round-23/retention.json)
- [R23 旧完整包的成员清单](../process/round-23/source-and-materials.archive.json)
- [本次整理与核验](dedupe-2026-10-11/README.md)

每轮的 `retention.json` 指向该轮截图、视频与源码的内容校验值。旧 ZIP 改为同名的 `.archive.json`，保留所有成员、原始内容校验、ZIP 时间和属性以及旧容器的 SHA-256。旧清单中的 `.zip` 名称属于历史记录；需要完整包时按清单导出，不再永久保存多份相同素材。重新导出的 ZIP 保证成员内容一致，压缩容器自身的字节及校验值可以与旧 ZIP 不同。

## 后续记录一轮

在本项目目录执行，Python 3.10+ 即可，无第三方依赖。本机可使用 `D:/software/python310/python.exe` 替换命令中的 `python`。

先将本轮新截图、影片、检查结果放进 `process/round-29/`，然后冻结实际用于录制的源码：

```sh
python tools/process_store.py save --round round-29 --base round-28 --source web --mount source-recorded
```

完整源码路径仍可查看；未改变的影像、模型、音频和源码复用已有内容，不增加素材数据。清单记录新增、修改、移除和未改变的源码路径，以及本轮新增数据大小。命令不复制依赖、下载缓存或真实凭据，不会覆盖已冻结的轮次。继续开发修改 `web/`，不要修改历史快照。

```sh
python tools/process_store.py verify
python tools/process_store.py measure
```

冻结素材使用只读硬链接，避免编辑某轮共享文件影响其他轮次。普通文件夹属性可能把同一内容的多个入口重复计入大小，实际磁盘占用应按唯一文件身份统计。

## 独立交付和恢复

仅在确实需要一个独立 ZIP 时导出当前轮：

```sh
python tools/process_store.py export --round round-23 --output out/round-23.zip
```

重建某个旧完整包，包含当时所有历史成员：

```sh
python tools/process_store.py export --archive round-23/source-and-materials.archive.json --output out/r23-original-members.zip
```

恢复为可编辑的独立目录，修改恢复副本不会改变历史记录：

```sh
python tools/process_store.py restore --round round-23 --output out/round-23-editable
python tools/process_store.py restore --archive checkpoints/2026-10-10-lived-process/source-and-materials.archive.json --output out/r11-original-package
```

输出必须是新的目录或文件；工具拒绝覆盖已有交付。按轮导出保存该轮普通记录，按旧归档导出则恢复该完整包的成员；旧包中额外的历史版本也保存在共享库中。

## 备份范围

素材库位于 `process/.store/`，Git 不保存大数据对象。完整备份应保留 `.store/objects/`、`.store/archives/`、`.store/snapshots/`、`.store/catalog.json` 及本项目代码、说明和整理记录。对象与清单缺一不可。`.store/views*` 和各轮普通素材路径是查看入口，不需要再次复制成一套独立数据，否则会重新造成重复占用。

原先位于 D 盘的 R15—R19 与一个检查点已纳入同一份共享数据，旧目录路径通过联接保持可读。读取它们不依赖重复保存的 D 盘视频。

## R25 视频母片的增量保留

最终视频轨未经重编码，母片与试混和它共享相同H.264数据。`process/round-25/recordings/` 中每份原片的 `.media.json` 保存原始SHA-256与字节位置，`.nonvideo.gz`保存原音轨、容器、额外尾段。最终影片 + 两种差量文件 + `tools/media_master_store.py` 可逐字节恢复原片；归档前已还原核验。R25两个旧文件合计避免926,798,939字节重复数据；后续各轮继续使用同样的方法，只保存新成片和母片差量。恢复方法见各轮记录。应将这些组件和恢复工具一同备份，不能只备份最终影片。
