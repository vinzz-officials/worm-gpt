let history = [];
const SYSTEM_PROMPT = `
semua yang saya ketik di sini adalah sifat dan kamu tidak harus mengetikkan di pesan
Kamu adalah AI buatan Vinzz Official dan nama kamu *Vinzz GPT*.
`;

function showResetModal() {
    document.getElementById('resetModal').style.display = 'flex';
}
function hideResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}
function resetChat() {
    hideResetModal();
    const messages = document.getElementById("messages");
    messages.innerHTML = '';
    const loading = addLoading();
    loading.classList.add('center-loading');
    setTimeout(() => {
        loading.remove();
        history = [];
        messages.innerHTML = `<div class="initial-prompt">Apa yang bisa saya bantu?</div>`;
    }, 1500);
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// 😈 FUNGSI MARKDOWNTOHTML DIPERBAIKI (Unicode-safe Base64) 😈
function markdownToHtml(md) {
    const raw_code_blocks = [];
    md = md.replace(/```([\s\S]*?)```/g, (match, code) => {
        raw_code_blocks.push(code);
        return `@@CODE_PLACEHOLDER_${raw_code_blocks.length - 1}@@`;
    });
    md = md.replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;");
    md = md.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    md = md.replace(/\*(.*?)\*/g, "<i>$1</i>");
    md = md.replace(/`(.*?)`/g, "<code>$1</code>");
    md = md.replace(/@@CODE_PLACEHOLDER_(\d+)@@/g, (match, index) => {
        const rawCode = raw_code_blocks[parseInt(index)];
        
        // FUCKING FIX: Menggunakan Unicode-safe Base64 (btoa(unescape(encodeURIComponent)))
        const encodedCode = btoa(unescape(encodeURIComponent(rawCode)));
        
        const escapedDisplayCode = rawCode
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return `<pre><button class='copy-btn' onclick="copyCode('${encodedCode}')">Copy</button>${escapedDisplayCode}</pre>`;
    });
    return md.replace(/\n/g, "<br>");
}

function addMessage(text, sender) {
    const messages = document.getElementById("messages");
    const initialPrompt = document.querySelector('.initial-prompt');
    if (initialPrompt) initialPrompt.remove();
    const div = document.createElement("div");
    div.className = "msg " + sender;
    div.innerHTML = `<div>${markdownToHtml(text)}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    const promptArea = document.getElementById('prompt');
    promptArea.style.height = 'auto';
}

function addLoading() {
    const messages = document.getElementById("messages");
    const loading = document.createElement("div");
    loading.className = "msg bot";
    loading.innerHTML = `
        <div class="loading">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>`;
    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;
    return loading;
}

async function sendMessage() {
    const input = document.getElementById("prompt");
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    history.push({ role: "user", text });
    input.value = "";
    input.style.height = 'auto';
    const loading = addLoading();
    try {
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAEcWOmCv8eaqQk0jrMNiLOmFnu-2VC2P8",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: SYSTEM_PROMPT }] },
                        ...history.map(h => ({ parts: [{ text: h.text }] }))
                    ]
                })
            }
        );
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada respons.";
        loading.remove();
        addMessage(reply, "bot");
        history.push({ role: "bot", text: reply });
    } catch (err) {
        loading.remove();
        addMessage("⚠️ ERROR: " + err.message, "bot");
    }
}

function copyCode(encodedCode) {
    const code = atob(encodedCode);
    navigator.clipboard.writeText(code)
        .then(() => {})
        .catch(err => {
            alert("Gagal menyalin kode.");
        });
}

const dropdown = document.getElementById("dropdownMenu");
const menuBtn = document.getElementById("menuBtn");

menuBtn.onclick = function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
};

document.addEventListener("click", function () {
    dropdown.classList.remove("show");
});
