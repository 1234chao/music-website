window.onload = function(){
    loadAllMusic();
}

// 加载全部歌曲
async function loadAllMusic(){
    const res = await fetch("/api/music");
    const list = await res.json();
    renderMusic(list);
}

// 搜索歌曲
async function searchMusic(){
    const keyword = document.getElementById("searchInput").value.trim();
    if(!keyword){
        loadAllMusic();
        return;
    }
    const res = await fetch(`/api/music/search?key=${encodeURIComponent(keyword)}`);
    const list = await res.json();
    renderMusic(list);
}

// 渲染卡片
function renderMusic(musicArr){
    const box = document.getElementById("musicList");
    box.innerHTML = "";
    if(musicArr.length ===0){
        box.innerHTML = "<p>没有找到歌曲</p>";
        return;
    }
    musicArr.forEach(song=>{
        box.innerHTML += `
        <div class="music-card">
            <h4>${song.name}</h4>
            <audio controls src="${song.url}">
        </div>
        `
    })
}

// 上传歌曲
async function uploadSong(){
    const name = document.getElementById("songName").value.trim();
    const fileDom = document.getElementById("audioFile");
    if(!name || !fileDom.files[0]){
        alert("请填写歌曲名并且选择mp3音频文件");
        return;
    }
    const formData = new FormData();
    formData.append("audio", fileDom.files[0]);
    formData.append("songName", name);
    const resp = await fetch("/api/upload",{
        method:"POST",
        body: formData
    })
    const data = await resp.json();
    if(data.ok){
        alert("上传成功！");
        loadAllMusic();
        document.getElementById("songName").value = "";
        fileDom.value = "";
    }else{
        alert("上传失败");
    }
}
