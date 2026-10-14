# 数据与开源代码致谢

## R42 区域 500 米影像与山河通道探索

区域显示使用 NASA Blue Marble Next Generation 2004 年 6 月含地形阴影的 C1、D1 两块原生 500 米影像，按 73–96°E、35–49°N 裁切拼接为 5520×3360。原始下载临时处理后移出缓存；URL、下载文件大小、SHA-256、裁切像素和输出变换保存在 `assets/regional-imagery-500m.json`。来源：[NASA 官方数据页](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/)，署名 NASA Earth Observatory / Reto Stöckli。遵循 [NASA 影像使用说明](https://www.nasa.gov/nasa-brand-center/images-and-media/)。这不是当前卫星影像，也未提升 DEM 的采样精度。旧的 1380×840 区域影像仍保留供历史版本恢复。

五步探索、两条比较线、高程剖面、地图示踪和结构标记由本地独立实现。比较线为教学几何，不是张骞逐站路线；坎儿井展示工程原理，不指定建造年代，不作为张骞到访或建造的证据。历史网络与工程概念参照 [UNESCO 丝路](https://whc.unesco.org/en/list/1442/) 与 [UNESCO 坎儿井](https://whc.unesco.org/en/tentativelists/5347/)。原有代码、影像和声音来源继续保留。

<!-- R19-MARKERS -->
R19 的定位点、连接线、讲解标记、接物动作与镜头为原创。讲解绑定实际可见对象；定位线不是测量、真实历史路线或政策预测。49条MiniMax原音频及既有影像、高程来源保持不变，人物与台词为原创教学创作。
<!-- /R19-MARKERS -->


<!-- R18-PERFORMANCE:START -->
R18沿用已有真实DEM、NASA与Sentinel影像、49条MiniMax speech-2.8-hd系统声线音频。新增人物模型、IK接物、振幅口型、视线、原创主题物件与镜头；这些是教学创作，音量同步不等于音素识别或真实人物录像。
<!-- R18-PERFORMANCE:END -->

本地三维教学场景为独立实现，未取得 Moby 原演示源码，也未确认其引擎、模型与资产许可。

## Three.js

- 仓库：https://github.com/mrdoob/three.js
- 固定版本：npm three 0.186.1；完整性见 web/package-lock.json。
- npm 发布记录 gitHead：9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8（2026-10-10 查询 npm registry）。
- License：MIT，Copyright © 2010–2026 three.js authors。
- 保留原始全文于 assets/THREE-LICENSE.txt（子项目文档目录）与 vendor/THREE-LICENSE.txt（构建后的发布目录）。未修改上游模块。

## 地球影像

NASA Earth Observatory — Blue Marble: Next Generation，2004 年 6 月合成底图。

- 说明：https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/
- 地球文件：https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/june/world.topo.bathy.200406.3x5400x2700.jpg
- 地球处理：5400×2700 缩为 4096×2048，JPEG 重编码。影像自带地形与海底阴影，球体没有加载全球高程。说明：https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/
- 区域文件：https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june/world.200406.3x21600x10800.jpg
- 区域处理：按 73–96°E、35–49°N 等经纬投影裁切为 1380×840，贴到同范围 DEM。不是局部航拍纹理，不能提供米级地表细节。
- Credit：NASA Earth Observatory / Reto Stöckli，Blue Marble Next Generation。公开 NASA 科学影像，不暗示 NASA 对本实验的认可。

## 真实高程

Terrain Tiles accessed on 2026-10-10 from https://registry.opendata.aws/terrain-tiles/.

Mapzen Terrain Tiles. GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.

- 编码与处理：https://github.com/tilezen/joerd/blob/master/docs/formats.md
- 数据来源：https://github.com/tilezen/joerd/blob/master/docs/data-sources.md
- 许可与致谢：https://github.com/tilezen/joerd/blob/master/docs/attribution.md
- 区域：73–96°E、35–49°N，z=8，769×513；天池：88.07–88.19°E、43.83–43.95°N，z=13，321×289；冰川周边：86.76–86.89°E、43.04–43.17°N，z=14，321×321。
- 2026-10-10 天池 z=14 源瓦片出现不合理的负高程，未使用，改用通过范围检查的 z=13；不通过人工补值美化地形。材质颗粒、岩层、冰面裂隙、波纹和凹部明暗均独立生成，不改变真实高程。
- 原始 PNG 按 RGB Terrarium 编码解码，双线性重采样为经纬度网格，取整到米。瓦片 URL、SHA-256 与派生网格哈希在 assets/data-sources.json。
- 运行时按真实高程生成几何，使用教学配色、显示基准与可调高度夸张。数据源包含多种融合数据，未逐像素判定 SRTM / GMTED 来源。展示采样间距不能当作数据精度或地理测量保证。
- 未虚构缺失高程；矩形展示范围包含周边，不表示行政边界。湖面轮廓与高度为独立示意，不修改原始 DEM。

## 局部真实卫星影像（2026-10-10 接入）

天池：**Contains modified Copernicus Sentinel data 2024**。
一号冰川周边：**Contains modified Copernicus Sentinel data 2023**。

- Sentinel-2A Level-2A 的原始 10 m TCI 真彩色产品（B04 / B03 / B02），通过 Element 84 Earth Search / AWS Sentinel-2 COGs 公开读取。数据说明：https://registry.opendata.aws/sentinel-2-l2a-cogs/ 。分辨率说明：https://sentiwiki.copernicus.eu/web/s2-mission 。
- Sentinel 数据可公开访问、处理与分发，按修改数据的要求保留上述来源声明；数据许可独立于 Three.js MIT。Legal Notice：https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice 。说明：https://dataspace.copernicus.eu/terms-and-conditions 。
- 天池：2024-09-04T05:16:32.793Z，S2A_45TWJ_20240904_0_L2A，处理基线 05.11；天池 DEM 同范围 88.07–88.19°E / 43.83–43.95°N，963×1336 JPG。
- 冰川：2023-08-31T05:16:56.537Z，S2A_45TVH_20230831_0_L2A；冰川 DEM 同范围 86.76–86.89°E / 43.04–43.17°N，1057×1448 JPG。
- 按真实 UTM 45N 源变换读取局部原生 TIFF 块，再双线性重投影为 EPSG:4326 北向上纹理。输出约 10 m / 像素，没有使用 AI 超分、插画、虚构覆盖、云填补或跨期拼接。TCI 已做真彩色显示映射，未把 8 位 TCI 当作定量反射率。
- 两处局部 SCL 的 8 / 9 / 10 云类为 0%，无 0 类缺测。20 m 自动分类不等于人工逐像素核验。冰川最终选择 2023-08-31，避免 2024-09-04 大范围季节积雪遮盖裸岩；不是用两日期进行退缩测量。
- 默认隐藏湖面和冰体教学叠层，保留真实湖岸和冰雪。选择汇流/退缩镜头或开关叠层才显示独立示意。真实影像保持固定日期，教学冰体不替代年度遥感边界。
- 原 STAC 记录、来源 URL、源 CRS / 像素变换、裁切范围、局部 SCL、JPG 与读取字节范围 SHA-256 在 assets/data-sources.json、tianchi-sentinel-stac.json、glacier-sentinel-stac.json。完整源 TCI 没有下载，不记录虚构的整幅哈希；本地稀疏 TIFF 仅为被忽略的传输缓存。

## 教学内容依据

- 丝路网络与路线概念：https://www.unesco.org/en/silk-roads/about-silk-roads?hub=196704
- 沙漠路线考察：https://www.unesco.org/archives/multimedia/document-4583
- 坎儿井结构：https://whc.unesco.org/en/tentativelists/5347/
- 天池湖面高度的显示参考（1910 m）：新疆自然资源厅第一批地质遗迹说明，https://zrzyt.xinjiang.gov.cn/xjgtzy/zydzyj/202512/de061bfb812144e995a84d0138d588cf.shtml

本地城市坐标为现代城市中心的近似定位；路线插值不代表考证行程或道路导航。坎儿井模型由代码生成，来水参数控制粒子动画，不运行水文方程。图片与课程的使用权限独立于引擎许可证。

- 锡伯西迁年代与启讫概念依据：https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml 。球面路线为方向示意，未考证逐站路径。
- 雅丹风蚀与雨水冲刷概念：https://zrzyt.xinjiang.gov.cn/xjgtzy/dzyjxq1/202307/18a525fe156e42d8bfc1c80f6adb8947.shtml 。数学地貌模型不包含真实年代或侵蚀方程。
- 喀纳斯生态与保护地点：https://www.xinjiang.gov.cn/xinjiang/hbddc/202207/ef62a8d25af24b13b9f2dab4260a37ec.shtml 。光圈不是法定范围，未引入保护边界数据。
- 一号冰川定位：https://www.ncdc.ac.cn/portal/metadata/22322d3e-e38e-427c-b979-0b8dc90fddb7 。只参考位置，未下载该中心年度观测序列。冰体独立生成，阶段、厚度与缩减幅度不对应真实年份或测量。
- 新疆全球定位轮廓由代码手绘，用于位置提示，没有引入法定边界矢量。
- 当前故事使用33条导览与19条角色分支MiniMax speech-2.8-hd系统声线音频，人物与讲稿为独立创作；十二条改写或新增导览已在R25补齐。可选本机朗读使用Web Speech API。作者音轨仅在原视频播放器中保留，没有用作本地人物或导览声音。

## 原帖研究材料

research.html 使用 Moby 原帖的视频封面并链接原帖：https://x.com/readyfor2025/status/2108409664018977249 。该画面的许可未确认，不视为开源素材，也没有用于本地三维场景。

## 探索手记与冰谷窗口（R7）

探索手记的 2024-09-04 冰川候选图来自本地已保存的 S2A_45TVH_20240904_0_L2A 研究素材，署名 **Contains modified Copernicus Sentinel data 2024**，沿用上述 Sentinel 数据使用条件。当前冰谷纹理仍为 2023 年观测，原文件与哈希不修改。

冰谷窗口是原 321×321 DEM 中第 55–227 列、108–238 行的原样裁取；UV 按同一边界显示观测。显示高度、教学冰体、箭头和收支响应为本地创作。冰川质量收支与流动说明参考 [NSIDC](https://nsidc.org/learn/parts-cryosphere/glaciers/why-glaciers-matter)、[USGS](https://www.usgs.gov/programs/ecosystems-land-change-science-program/science/mass-balance-methods-measuring-glacier)。

## R9 多领域叙事

- 木卡姆四种区域风格与歌舞音乐：UNESCO，https://ich.unesco.org/en/RL/uyghur-muqam-of-xinjiang-00109?lang=en ，2008 列入代表作名录。未复制演出照片、录音或影像。
- 锡伯西迁的历史调遣：国家民委，https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml ，2018 历史资料。球面路径为方向示意。
- 当代三片区与制度要求：国务院 2023 总体方案，https://app.www.gov.cn/govdata/gov/202310/31/508877/article.html 。功能定位是方案安排，不声称实绩或预测。
- 关系图、六章中文讲稿和问题综合为独立编写；近似城市点与概念联系线由本地代码生成。不同流域的冰谷与天池作为不同观察例子，不声称同一条实测水路。


## R10 四个原创生活场景

R11 在这些原创世界中补充完整动作过程：取货／交接／返回、弯曲脚步、渠水与劳动、示范与学习者轮换、分拣和逐车行进状态。`lived-process.js` 与个人观察回看由本地独立编写，未增加第三方模型或演出素材。`assets/lived-*-r11.png` 为本地实际网页截图；动作时间与参数没有真实效率或表演标定。

`lived-model.js`、`lived-scenes.js` 独立编写。人物、服饰、建筑、商队、货物、地毯图案、庭院、乐器道具、仓储和物流关口均由本地几何与 CanvasTexture 生成；没有引用第三方人物模型、演出照片、录音或动画。

内容依据沿用上列 UNESCO 丝路、UNESCO 木卡姆、国家民委历史沿革及国务院 2023 总体方案。人物动作与拍点是教学创作，不是木卡姆曲式或专业舞蹈复原；家庭与聚落表达调遣、远行和后续生活，不是精确历史场景；三片区语义布局不构成地图定位，服务时长、车流和绿地比例不构成经济成效测量。截图 `assets/lived-*-r10.png` 为本地实际浏览器画面。

## R13 画面回应与原创声音

生活道具、土墙纹理、室内、披裹、食物、器物工作台、庭院棚架和服务人员由本地几何独立编写。未引入第三方人物模型、音效库、演出录音或照片。服饰和建筑为概括创作，不据此定义民族样式；不同社区与年代在主线中分别说明。

`assets/audio-script.json` 为独立中文讲稿；30 条 `assets/audio/*.mp3` 由本地 Windows System.Speech 的 Microsoft Huihui Desktop 合成，WAV 母片、时长、哈希及转换脚本保留在 R13 过程档案。`soundscape.js` 的风、水、脚步、交接和回应声由本地振荡器及过滤噪声生成。庭院原创拍点不代表木卡姆真实曲式、乐器演奏或专业舞步。

区域显示地形为原 769×513 高程的 193×129 邻点加权显示网格，默认显示高度 22×；原始数据与哈希保留。微缩水线与连接路径组织叙事，不表示真实流域路线或距离。

## R14 家庭记忆、社区传习与公共协商

锡伯语言文字与西迁纪念的内容参考国家民委 2023-04-18 转载资料：https://www.neac.gov.cn/seac/c103391/202304/1162735.shtml 。家庭、家书、工具和交接动作均为原创。家书不含伪造锡伯语、历史签名或档案文本；现代文字实践与历史迁行场景分别说明。

木卡姆四种传统资料卡只提供知识导航，沿用 UNESCO 项目依据，没有演奏或复原各风格真实曲目。三位当代角色、协商桌、轮换通行、集中转运和保留生境方案是原创情境，不是官方议事程序，也不代表真实政策效果。新增人物、花床、学习记录和需求令牌由本地几何生成。

10 条新增人物对白为独立创作，以本地 Microsoft Huihui Desktop / System.Speech 普通话合成；不是历史引语、社区访谈或真实人物声音，不模仿民族口音。30 条旁白中的 10 条本轮重写，20 条保留。全部实际声音稿、WAV、时窗、哈希和渲染脚本保存在 R14 过程档案。


## R15 原创入口与绿洲情境

2026-10-11，区域真实 DEM 与影像、Three.js 版本与许可证沿用既有记录。入口卡片采用 R15 实际浏览器截图裁切，裁切范围与原图 SHA-256 保留在 `process/round-15/thumbnail-provenance.json`。没有用合成图片冒充可运行场景。新家庭、两条支渠、水闸、田地、五位角色及回应为原创教学情境，不代表真实村落、实际水量分配或同一实测水系。

新增两条普通话合成用水对白、更新五条开场旁白并精简关口转场；使用本地 Microsoft Huihui Desktop / System.Speech。30 条旁白、12 条对白及合成环境声均保留讲稿、母片、文件与哈希。没有使用原演示录音、真实人物采访、民族口音模仿或真实木卡姆曲目。

<!-- R17-AUDIO-ATTRIBUTION:START -->
## R17 · MiniMax 原创合成旁白与角色对白（2026-10-11）

- 提供方：MiniMax；模型 `speech-2.8-hd`，本轮实际使用兼容接口 `https://api.minimaxi.com/v1/t2a_v2`。现行中国站[同步接口文档](https://platform.minimax.cn/docs/api-reference/speech-t2a-http)与[系统声线列表](https://platform.minimax.cn/docs/faq/system-voice-id)。
- 30条原创普通话旁白、19条可用分支对白、9个系统声线；完整观看播放相应演示分支，不同时播放全部分支。声线、台词、每次take请求参数与响应摘要、时长和SHA-256在本地过程档案中保留，不包含密钥。
- 32kHz单声道128kbps MP3生成；交付响度目标−18LUFS、真峰值−1.5dBTP。超窗句子重新合成，语速上限1.4，不进行atempo硬加速。
- 本轮采用系统声线，不克隆真实人物，也不冒充民族口音；合成声音不是采访、历史原话或真人录音。原创WebAudio环境与教学节奏不复原真实木卡姆曲目。
- 地形、NASA／Sentinel影像、来源数据与上游许可证继续适用。自然的语音听感不增加史实、民族志、水文或政策成效的证据强度。
<!-- R17-AUDIO-ATTRIBUTION:END -->

## 项目总览的原片与实际影片

R24时的`overview.html`接入已经保留的原帖视频（125.13 秒）和 R23 实际完整影片（631.05 秒）。原片来源：https://x.com/readyfor2025/status/2108409664018977249 。原片许可证未确认，用于本地参考研究；没有作为本地三维纹理、人物模型或音频生成输入。完整原音轨与画面未改写，片段按钮只改变观看位置。

静态观看路径为本地保留素材的硬链接，按需读取；来源、大小与 SHA-256 见 `assets/records/media.json`。原片入口缩略图取自既有原片0:01实帧；R24影片缩略图为R23区域定位实际帧；R25已更新为新成片实帧。天池与雅丹入口缩略图为 R05 留档，已在页面注明，其他当前展示使用 R23 实际素材。

## R25 · 完整空间导览与原创声景

2026-10-11，使用MiniMax `speech-2.8-hd`和既有普通话旁白系统声线新生成十二条空间导览，九条更新、三条新增；目前33条导览与19条角色分支。请求、响应摘要、时长和SHA-256保留在R25，不包含凭据。声景、材质接触音、轻微庭院反射和教学演奏均为原创合成，不是当地实地录音或真实木卡姆复原。动作音来自渲染脚掌支撑、双手道具交接和实际演奏相位。

项目总览展示R25新成片，R23历史影片和原帖完整音画保持只读。原片未作为生成输入；人物仍是简化原创造型，口型为实际语音振幅同步。最终测量与声画匹配见本轮验证文件。


## R80 · 第一次出使与远行情境（2026-10-14）

依据中国国家博物馆“中华史诗”展览与敦煌研究院《张骞出使西域图：凿空丝路的图像记忆》，采纳公元前138年出发、十余年被扣留、后经大宛与康居至大月氏、结盟目的未达成的叙述。未为拘留地点编造坐标，未采用资料中相互矛盾的脱身年份。现代地域参照点和区域连线不表示精确道路。

- 中国国家博物馆：https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/
- 敦煌研究院：https://www.dha.ac.cn/info/1266/2524.htm
- UNESCO长期交流网络：https://whc.unesco.org/en/list/1442/

荒漠地形、沙纹、随行者、驮马、旌节、水囊、动作、足迹和环境声均为本地原创。服饰未完成汉代考据，形象不定义民族身份；近景不是张骞亲历的具体停留或测绘地貌。旌节按持节叙述概括表达，未作器物复原；敦煌唐代壁画不作为汉代服装复原依据。

两条原创中文旁白使用MiniMax speech-2.8-hd和既有系统普通话声线，32kHz单声道128kbpsMP3，响度目标−18LUFS、真峰值−1.5dBTP。没有声音克隆或民族口音模仿。字幕优先采用接口时序，缺失时按文字长度分配；第二条字幕下载失败后保留已成功生成的音频，没有再次请求合成。母片、请求内容哈希、响应摘要和交付哈希留档，凭据不入档。


## R81 · 历史依据纠正

R80的沙丘、风沙、取水与人物行进没有对应张骞第一次出使路段的依据，不能作为历史复原。已将荒漠近景与旧旁白移出默认历史导演；已有模型保留为独立动画实验，入口、标签与介绍均明确无历史行程归属。下面的R80记录是已被本轮纠正的探索过程，不能当作当前历史实现依据。

依据《史记·大宛列传》及中国国家博物馆的出使介绍，地图依次展示出陇西、长期扣留、到大宛、经康居到大月氏、至大夏及归途再被扣留后返汉。补齐康居、大夏；拘留地点不定点，地域之间不连未经本项目考定的道路。现代地域参照不是古国边界或古都坐标。

本轮重新生成一条MiniMax旁白，逐段突出相应地域；字幕与视觉提示采用接口段落时间，段落内语句位置按文字长度估计，尚非逐字对齐。三条历史导演共42幕，37份已有录音保留，其中旧荒漠录音仅归档；现用导演录音36份，跨路径实际独立新增录音27份。暂停、接管、缩放及返回地图保留。汉代人物服饰与沿途景观尚未完成考据，不将独立实验视为汉代复原。

来源：《史记·大宛列传》 https://ctext.org/shiji/da-wan-lie-zhuan/zhs ；中国国家博物馆 https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/ 。来源复核、实际截图、音频母片、请求与交付哈希、检查及源码增量记录见process/round-81/。



## R82 · 察布查尔：按年代观察屯居与水利

默认锡伯导演的近景不再比较虚构的“先安顿/先引水”历史决策，而是可切换的三个阶段：1766年春以后安置与初期支流灌溉、19世纪初组织开挖新渠、1808年初大渠竣工放水。国家民委资料说明初期已有利用绰霍尔河等支流水源的灌溉与耕作；不得把农业出现整体推迟到1808年，也不得把新大渠提前到1766年。

3D模型保留右侧住处与初期田地，左侧新渠槽在施工阶段逐段延伸；放水阶段青色水流前进，新增田垄随后显现。人物是匿名的安置/劳动符号，不指定历史人物身份，不宣称同一家人在42年中容貌不变。人物服饰、房屋及渠线仍是关系示意，不是清代村庄或真实大渠布局复原，作物变化不是实测水文/即时生长。未将开工年硬写成1802年。

锡伯导演新增“1808放水”一幕；三路径合计43幕，张骞15、都护14、锡伯14。五段MiniMax近景旁白更新；导演素材总38份（含归档荒漠1份），有效历史导演37份，其中28份独立录音、9份复用历史旁白。旧录音在已有冻结轮次保留。新语音为speech-2.8-hd、Chinese (Mandarin)_Gentleman、32kHz单声道，-18 LUFS目标混音；字幕未做逐字对齐。

支持切换年代、重播阶段、暂停/继续、自由镜头、导演接管后继续当前变化和返回地图。切回早期会收回后建新渠及其阴影。原有生活情境有明确独立入口，修复“先安顿/先引水”按钮只转发到旧控件而未改变实际模型的问题。

史实依据：国家民委《锡伯族·历史沿革》 https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml ，黑龙江省人民政府（省民宗委资料） https://www.hlj.gov.cn/hlj/c108504/202503/c00_31820374.shtml ，核查于2026-10-14。过程见process/round-82/，使用process_store.py按SHA-256在round-81上增量保存；没有新增累计打包影片。

## R83 · 服饰、斜顶民居与渠边劳动的形制观察

本轮重点更新锡伯路径近景。依据国家民委《锡伯族·风俗习惯》的传统形制记述，增建斜顶土墙房、木门窗、低墙庭院，男子长袍、腰带、圆顶帽和长靴；改善人物头身比例、双手握柄、工具落地、河面和叶形。资料不能证明某座1766年民居或某套1808年服装；面容、颜色、裁片、数量与布局属于原创模型设计，不作逐件历史复原。

“全景、民居、服饰、劳动与渠水”四种观察将镜头、对象标记、介绍和字幕连在一起。锡伯自动导演的安置幕观察右侧屯居与初期灌溉，开渠幕靠近劳动现场，放水幕恢复水系全景；用户可缩放、暂停、自由接管与返回来时地图。旧家庭选择和原人物建筑模型继续保留为独立情境。原五段R82 MiniMax旁白与已有环境音继续复用，没有新生成语音或整片影片。

传统形制来源：https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml 。年代来源：https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml 。核查于2026-10-14，表示范围见assets/settlement-period-sources.json。当前仍是有依据的可操作示意模型，未达到完整写实复原；张骞和都护的其他近景资产没有在本轮统一改成经过考证的古代场景。

