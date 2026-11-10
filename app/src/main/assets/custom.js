window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>GBK双向转换</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,SimSun}
body{padding:16px;background:#fff;font-size:16px}
h2{text-align:center;margin-bottom:14px;font-size:18px}
.radio-group{margin-bottom:12px;text-align:center}
.radio-group label{margin:0 8px;font-size:15px;cursor:pointer}
#inputBox{width:100%;padding:10px 8px;font-size:16px;border:1px solid #aaa;border-radius:6px;margin-bottom:10px}
.btn-group{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
button{padding:10px;border:none;border-radius:6px;background:#4078c0;color:#fff;font-size:15px}
button:active{background:#2b5994}
#resultBox{width:100%;min-height:260px;border:1px solid #ddd;padding:10px;white-space:pre-wrap;overflow-y:auto;font-size:15px;background:#fafafa;border-radius:6px}
input[type="file"]{display:none}
</style>
</head>
<body>
<h2>GBK双向转换工具</h2>
<div class="radio-group">
  <label><input type="radio" name="mode" value="gbk2han" checked> GBK→汉字</label>
  <label><input type="radio" name="mode" value="han2gbk"> 汉字→GBK</label>
</div>
<input id="inputBox" type="text" placeholder="输入内容，点转换，支持回车">
<div class="btn-group">
  <button onclick="convert()">转换</button>
  <button onclick="document.getElementById('fileInput').click()">读取TXT</button>
  <button onclick="clearResult()">清空记录</button>
  <button onclick="exportTxt()">导出TXT</button>
</div>
<input type="file" id="fileInput" accept=".txt" onchange="loadTxt(this)">
<div id="resultBox"></div>

<script>
const resultBox = document.getElementById('resultBox');
const inputBox = document.getElementById('inputBox');

// 【关键】GBK解码器，兼容所有安卓浏览器
const gbkDecode = function(hexStr){
  try{
    hexStr = hexStr.replace(/\s/g,'');
    if(hexStr.length %2 !==0) return "❌转换失败";
    const bytes = [];
    for(let i=0;i<hexStr.length;i+=2){
      bytes.push(parseInt(hexStr.substr(i,2),16));
    }
    const u8 = new Uint8Array(bytes);
    return new TextDecoder('gbk').decode(u8);
  }catch(e){return "❌转换失败";}
}

// 汉字转GBK 稳定方案（用TextEncoder+转码垫片，安卓兼容）
function charToGBKHex(str){
  try{
    const b = new Blob([str],{type:"text/plain;charset=gbk"});
    const fr = new FileReader();
    return new Promise((res,rej)=>{
      fr.onload = ()=>{
        const arr = new Uint8Array(fr.result);
        let s = "";
        arr.forEach(x=>s+=x.toString(16).padStart(2,'0'));
        res(s.toUpperCase());
      }
      fr.onerror=()=>rej();
      fr.readAsArrayBuffer(b);
    })
  }catch(e){return Promise.resolve("❌转换失败");}
}

async function convert(){
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const s = inputBox.value.trim();
  if(!s){alert("请输入内容");return;}
  let ret;
  if(mode === "gbk2han"){
    ret = gbkDecode(s);
  }else{
    ret = await charToGBKHex(s);
  }
  resultBox.innerText += `${s} → ${ret}\n`;
  resultBox.scrollTop = resultBox.scrollHeight;
}

// 回车触发
inputBox.addEventListener('keydown',e=>{
  if(e.key === "Enter") convert();
})

// 读取txt批量
async function loadTxt(el){
  const f = el.files[0];
  if(!f) return;
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const r = new FileReader();
  r.onload = async ev=>{
    const lines = ev.target.result.split('\n');
    let out = "";
    for(let line of lines){
      const s = line.trim();
      if(!s) continue;
      let res;
      if(mode=="gbk2han") res = gbkDecode(s);
      else res = await charToGBKHex(s);
      out += `${s} → ${res}\n`;
    }
    resultBox.innerText += out;
    resultBox.scrollTop = resultBox.scrollHeight;
  }
  r.readAsText(f);
  el.value = "";
}

function clearResult(){
  resultBox.innerText = "";
}
function exportTxt(){
  const txt = resultBox.innerText;
  if(!txt.trim()){alert("没有结果");return;}
  const blob = new Blob([txt],{type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gbk转换结果.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>
</body>
</html>
