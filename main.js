document.addEventListener('DOMContentLoaded', () => {
    // --- WebSocket Configuration ---
    // Postman par isi URL ne 101 status diya tha (trailing slash lazmi hai)
    const socket = new WebSocket('wss://akhtar-abbas-portfolio-backed.hf.space/ws/chat/');

    const chatLauncher = document.getElementById('ai-chat-launcher');
    const chatPanel = document.getElementById('ai-chat-panel');
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-question');
    const chatSend = document.getElementById('ai-chat-send');

    let messages = [{ role: 'assistant', content: "Hi, I am Akhtar's CV assistant. Ask me anything!" }];

    // --- UI Logic: Messages Render karna ---
    const renderMessages = () => {
        chatMessages.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `p-3 rounded-xl max-w-[85%] mb-2 ${
                msg.role === 'user' 
                ? 'bg-primary text-white ml-auto' 
                : 'bg-gray-100 text-slate-800 mr-auto'
            }`;
            div.textContent = msg.content;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // --- WebSocket Event Handlers ---
    socket.onopen = () => {
        console.log("✅ Connected to Backend");
    };

    socket.onmessage = (event) => {
        console.log("📩 Raw data from backend:", event.data);
        const data = JSON.parse(event.data);
        
        // "Thinking..." wala temporary message hatao
        if (messages.length > 0 && messages[messages.length - 1].content === "Thinking...") {
            messages.pop();
        }

        // Backend se 'message' field handle karo
        const reply = data.message || data.answer || "Sorry, I couldn't process that.";
        messages.push({ role: 'assistant', content: reply });
        
        renderMessages();
        
        // Button aur input ko wapis enable karo
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatSend.innerText = "Send"; 
    };

    socket.onerror = (err) => {
        console.error("❌ WebSocket Error:", err);
        // Error aaye toh button unlock kar do taake user dobara try kar sakay
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatSend.innerText = "Send";
    };

    socket.onclose = () => {
        console.warn("⚠️ WebSocket connection closed.");
    };

    // --- Chat Submit Logic ---
    const askQuestion = (e) => {
        e.preventDefault();
        const question = chatInput.value.trim();

        if (!question) return;

        if (socket.readyState !== WebSocket.OPEN) {
            alert("Backend is connecting... please wait a second.");
            return;
        }

        // UI update: User ka message aur "Thinking..." state
        messages.push({ role: 'user', content: question });
        messages.push({ role: 'assistant', content: "Thinking..." });
        renderMessages();

        // Backend ko bhej rahe hain
        try {
            socket.send(JSON.stringify({ 'message': question }));
            console.log("🚀 Message sent to backend");
            
            // Input clear aur button disable (jab tak response na aaye)
            chatInput.value = '';
            chatSend.disabled = true;
            chatInput.disabled = true;
            chatSend.innerText = "..."; 
        } catch (error) {
            console.error("Failed to send message:", error);
            chatSend.disabled = false;
            chatInput.disabled = false;
        }
    };

    // Event Listeners
    if (chatForm) {
        chatForm.addEventListener('submit', askQuestion);
    }

    if (chatLauncher && chatPanel) {
        chatLauncher.addEventListener('click', () => {
            chatPanel.classList.toggle('hidden');
        });
    }

    const closeBtn = document.getElementById('ai-chat-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatPanel.classList.add('hidden');
        });
    }

    renderMessages();
});