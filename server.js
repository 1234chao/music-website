const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();
// Render会自动注入PORT环境变量，不要硬写3000！
const port = process.env.PORT || 3000;

// 中间件
app.use(fileUpload());
app.use(express.json());
app.use(express.static('public'));

// 歌曲json文件，永久保存歌单信息
const dbPath = path.join(__dirname, 'musicList.json');
// 如果json文件不存在，新建空数组
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}
// 读取歌单
let musicList = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 保存歌单到json文件
function saveMusicDB() {
    fs.writeFileSync(dbPath, JSON.stringify(musicList, null, 2));
}

// 上传文件夹
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// 获取全部歌曲
app.get("/api/music", (req, res) => {
    res.json(musicList);
});

// 搜索歌曲
app.get("/api/music/search", (req, res) => {
    const keyword = req.query.key.toLowerCase();
    const result = musicList.filter(item => item.name.toLowerCase().includes(keyword));
    res.json(result);
});

// 上传歌曲接口
app.post("/api/upload", (req, res) => {
    if (!req.files || !req.files.audio) {
        return res.json({ ok: false, msg: "没有选中音频文件" });
    }
    const audioFile = req.files.audio;
    const songName = req.body.songName;
    const saveFileName = Date.now() + path.extname(audioFile.name);
    const fullPath = path.join(uploadDir, saveFileName);

    audioFile.mv(fullPath, (err) => {
        if (err) return res.json({ ok: false });
        const songInfo = {
            id: Date.now(),
            name: songName,
            url: `/uploads/${saveFileName}`
        };
        musicList.push(songInfo);
        saveMusicDB(); // 新增歌曲自动保存到json
        res.json({ ok: true, data: songInfo });
    })
})

app.listen(port, () => {
    console.log(`🎵 音乐网站启动成功！端口：${port}`);
})
