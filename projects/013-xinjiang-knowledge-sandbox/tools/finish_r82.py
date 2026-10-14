"""Update current entry descriptions without rewriting frozen research records."""
from pathlib import Path

project = Path(__file__).resolve().parents[1]
page = project / 'web/public/overview.html'
content = page.read_text(encoding='utf-8')
changes = [
    ('R81 / WATCH AND EXPLORE', 'R82 / WATCH AND EXPLORE'),
    ('先辨伊犁河谷与察布查尔，再看盛京方向的出发、抵达与安置，最后进入家庭。比较先安顿与先引水，观察灯火、渠水和家人回应。', '先辨伊犁河谷与察布查尔，再看盛京方向的出发、抵达与安置。近景分别展开1766年初期屯居、19世纪初新渠建设和1808年初放水，观察人物作业、来水与新增耕地。'),
    ('R76补齐十四段 MiniMax 地点、模型与回看旁白，三条导演共41幕全部有讲解与字幕；总计35个独立录音，旧12段地球/地图导览与9段历史讲解继续复用。', '当前三条导演共43幕，全部配置讲解与字幕；37个有效录音继续共享，锡伯路径本轮更新五段MiniMax旁白。原录音与旧版验证保留在过程记录。'),
    ('分别理解1764年出发、1765年抵伊犁、1766年安置和后续建设。再进入察布查尔家庭情境，比较先安顿和先引水，看具体需要与人物回应怎样连接。', '分别理解1764年出发、1765年抵伊犁与1766年安置，再进入屯居与水利关系模型。初期支渠灌溉保留，新渠建设、1808年初放水和新增耕地分期发生；原家庭选择可单独打开。'),
    ('动作与人物回应实际完成后才记录。两种观察可对照，回地图继续理解迁移与生活的不同尺度；重新进入家庭恢复本次选择、镜头和暂停状态。', '回到伊犁河谷，区分迁移、初期屯居和后来水利建设。原生活实验仍可比较安排次序，回应完成后记录；原选择、镜头与暂停状态继续保留。'),
    ('选地点后可进入原创家庭场景，决定先安顿或先引水。', '选地点后可进入分期近景，切换初期屯居、新渠建设与放水；原家庭选择另设入口。'),
]
for before, after in changes:
    assert content.count(before) == 1, before
    content = content.replace(before, after)
page.write_text(content, encoding='utf-8')
print('Current overview descriptions updated for R82.')
