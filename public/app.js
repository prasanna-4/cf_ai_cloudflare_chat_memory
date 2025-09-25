const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const reset = document.getElementById('reset');
const mic = document.getElementById('mic');
const tts = document.getElementById('tts');


const sessionId = localStorage.getItem('cf_session_id') || crypto.randomUUID();
localStorage.setItem('cf_session_id', sessionId);


function add(role, text){
const li = document.createElement('li');
li.className = role;
li.textContent = text;
chat.appendChild(li);
li.scrollIntoView({ behavior: 'smooth', block: 'end' });
if(role === 'assistant' && tts.checked && 'speechSynthesis' in window){
const u = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(u);
}
}


async function sendMsg(){
const message = input.value.trim();
if(!message) return;
add('user', message);
input.value = '';
const r = await fetch('/api/chat', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ sessionId, message }) });
const data = await r.json();
add('assistant', data.reply || '[no reply]');
}


send.addEventListener('click', sendMsg);
input.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }});
reset.addEventListener('click', async () => {
await fetch('/api/reset', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ sessionId }) });
chat.innerHTML = '';
});


// Voice input (Web Speech API)
let rec, recognizing = false;
if('webkitSpeechRecognition' in window){
const R = window.webkitSpeechRecognition; // Chrome
rec = new R();
rec.continuous = false;
rec.interimResults = false;
rec.lang = 'en-US';
rec.onresult = e => {
const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
input.value = text;
sendMsg();
};
rec.onend = () => { recognizing = false; mic.textContent = '🎤'; };
mic.addEventListener('mousedown', () => { if(recognizing) return; recognizing = true; mic.textContent = '🛑'; rec.start(); });
mic.addEventListener('mouseup', () => { if(recognizing) rec.stop(); });
} else {
mic.disabled = true; mic.title = 'Voice input not supported in this browser';
}