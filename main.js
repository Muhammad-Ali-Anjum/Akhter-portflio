document.addEventListener('DOMContentLoaded', () => {
    // --- WebSocket Configuration ---
    // URL check kar lena: akhtar-abbas-portfolio-backed.hf.space
    const socket = new WebSocket('wss://akhtar-abbas-portfolio-backed.hf.space/ws/chat/');

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');
    const scrollToTopButton = document.getElementById('scroll-to-top');
    const contactForm = document.getElementById('contact-form');
    const navLinks = Array.from(document.querySelectorAll('.nav-link, .mobile-nav-link'));
    const sections = Array.from(document.querySelectorAll('section[id]'));

    // --- UI Logic ---
    const setActiveNavLink = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('text-primary', isActive);
            link.classList.toggle('bg-gray-100', isActive);
            link.classList.toggle('font-semibold', isActive);
        });
    };

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(!isHidden));
        });
    }

    // Smooth Scroll
    document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href^="#"]');
        if (!anchor) return;
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            event.preventDefault();
            window.scrollTo({ top: targetElement.offsetTop - 78, behavior: 'smooth' });
        }
    });

    // --- Chat Widget Setup ---
    const chatWidget = document.createElement('div');
    chatWidget.id = 'ai-chat-widget';
    chatWidget.innerHTML = `
        <button id="ai-chat-launcher" class="fixed bottom-4 right-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition sm:bottom-6 sm:right-6">
            <i class="fas fa-comment-dots text-2xl"></i>
        </button>
        <div id="ai-chat-overlay" class="fixed inset-0 z-[60] hidden bg-slate-950/50 backdrop-blur-sm"></div>
        <section id="ai-chat-panel" class="fixed bottom-24 right-4 z-[70] hidden w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl sm:right-6 sm:w-[24rem]">
            <header class="flex items-center justify-between bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white">
                <div><p class="text-sm font-semibold">Ask about my CV</p></div>
                <button id="ai-chat-close" class="text-2xl text-white/90">&times;</button>
            </header>
            <div id="ai-chat-messages" class="max-h-[22rem] min-h-[15rem] space-y-3 overflow-y-auto px-4 py-4"></div>
            <form id="ai-chat-form" class="border-t border-slate-200 bg-white p-4">
                <div class="flex gap-2">
                    <input id="ai-chat-question" type="text" placeholder="Type your question..." class="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm" />
                    <button id="ai-chat-send" type="submit" class="bg-primary px-4 py-3 rounded-2xl text-white font-semibold">Send</button>
                </div>
            </form>
        </section>`;
    document.body.appendChild(chatWidget);

    const chatLauncher = document.getElementById('ai-chat-launcher');
    const chatPanel = document.getElementById('ai-chat-panel');
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-question');
    const chatSend = document.getElementById('ai-chat-send');

    let messages = [{ role: 'assistant', content: 'Hi, I am Akhtar\'s CV assistant. Ask me anything!' }];

    const renderMessages = () => {
        chatMessages.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `p-3 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white ml-auto' : 'bg-gray-100 text-slate-800 mr-auto'}`;
            div.textContent = msg.content;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // --- WebSocket Event Handlers ---
    socket.onopen = () => console.log("✅ Connected to Backend");
    socket.onerror = (err) => console.error("❌ WebSocket Error:", err);
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Remove "Thinking..." message and add real response
        if (messages[messages.length - 1].content === "Thinking...") {
            messages.pop();
        }
        messages.push({ role: 'assistant', content: data.message || data.answer });
        renderMessages();
        chatSend.disabled = false;
        chatInput.disabled = false;
    };

    const askQuestion = (e) => {
        e.preventDefault();
        const question = chatInput.value.trim();
        if (!question || socket.readyState !== WebSocket.OPEN) return;

        messages.push({ role: 'user', content: question });
        messages.push({ role: 'assistant', content: 'Thinking...' });
        renderMessages();

        // Send to Django Backend via WebSocket
        socket.send(JSON.stringify({ 'message': question }));

        chatInput.value = '';
        chatSend.disabled = true;
        chatInput.disabled = true;
    };

    chatForm.addEventListener('submit', askQuestion);
    chatLauncher.addEventListener('click', () => chatPanel.classList.toggle('hidden'));
    document.getElementById('ai-chat-close').addEventListener('click', () => chatPanel.classList.add('hidden'));

    renderMessages();
});