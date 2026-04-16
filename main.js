const CHAT_WS_URL = 'wss://akhtar-abbas-portfolio-backed.hf.space/ws/chat/';

const CHAT_WIDGET_HTML = `
<div id="ai-chat-widget" class="fixed bottom-6 right-6 z-[60]">
  <button id="ai-chat-launcher" class="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
    <i class="fas fa-comment-dots text-2xl"></i>
  </button>

  <div id="ai-chat-panel" class="hidden absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
    <div class="bg-primary p-4 text-white flex justify-between items-center">
      <div>
        <h3 class="font-bold">Akhtar's AI Assistant</h3>
        <p class="text-xs opacity-80">Ask me anything about Akhtar</p>
      </div>
      <button id="ai-chat-close" class="hover:text-gray-200"><i class="fas fa-times"></i></button>
    </div>

    <div id="ai-chat-messages" class="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
      <div class="flex justify-start">
        <div class="bg-white border p-3 rounded-lg shadow-sm max-w-[80%]">
          Hi! I'm Akhtar's AI. How can I help you today?
        </div>
      </div>
    </div>

    <div class="p-4 border-t bg-white">
      <form id="ai-chat-form" class="flex gap-2">
        <input type="text" id="ai-chat-question" placeholder="Type a message..." class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
        <button id="ai-chat-send" type="submit" class="bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
</div>
`;

const initChat = () => {
  // If the widget is not already on the page, inject it first.
  if (!document.getElementById('ai-chat-launcher') && !document.getElementById('chat-toggle')) {
    document.body.insertAdjacentHTML('beforeend', CHAT_WIDGET_HTML);
  }

  // Select elements only after the markup exists in the DOM.
  const chatLauncher = document.getElementById('ai-chat-launcher') || document.getElementById('chat-toggle');
  const chatPanel = document.getElementById('ai-chat-panel') || document.getElementById('chat-window');
  const chatMessages = document.getElementById('ai-chat-messages') || document.getElementById('chat-messages');
  const chatForm = document.getElementById('ai-chat-form') || document.getElementById('chat-form');
  const chatInput = document.getElementById('ai-chat-question') || document.getElementById('chat-input');
  const chatSend = document.getElementById('ai-chat-send') || chatForm?.querySelector('button[type="submit"]');
  const closeBtn = document.getElementById('ai-chat-close') || document.getElementById('close-chat');

  if (!chatMessages || !chatForm || !chatInput || !chatLauncher || !chatPanel) {
    console.warn('[Chat] Widget elements not found. Initialization skipped.');
    return;
  }

  const messages = [
    { role: 'assistant', content: "Hi, I am Akhtar's CV assistant. Ask me anything!" },
  ];

  const renderMessages = () => {
    chatMessages.innerHTML = '';

    messages.forEach((msg) => {
      const bubble = document.createElement('div');
      bubble.className = `p-3 rounded-xl max-w-[85%] mb-2 ${
        msg.role === 'user'
          ? 'bg-primary text-white ml-auto'
          : 'bg-gray-100 text-slate-800 mr-auto'
      }`;
      bubble.textContent = msg.content;
      chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const setControlsDisabled = (disabled) => {
    chatInput.disabled = disabled;
    if (chatSend) {
      chatSend.disabled = disabled;
    }
  };

  console.log('[Chat] Creating WebSocket:', CHAT_WS_URL);
  const socket = new WebSocket(CHAT_WS_URL);

  socket.onopen = () => {
    console.log('[Chat] WebSocket open:', {
      readyState: socket.readyState,
      url: CHAT_WS_URL,
    });
  };

  socket.onmessage = (event) => {
    console.log('[Chat] Raw backend payload:', event.data);

    if (messages.length > 0 && messages[messages.length - 1].content === 'Thinking...') {
      messages.pop();
    }

    let data = event.data;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        data = { message: data };
      }
    }

    const reply =
      data?.message ||
      data?.answer ||
      data?.response ||
      data?.content ||
      'Sorry, I could not process that.';

    messages.push({ role: 'assistant', content: reply });
    renderMessages();
    setControlsDisabled(false);
    if (chatSend) {
      chatSend.textContent = 'Send';
    }
  };

  socket.onerror = (event) => {
    console.error('[Chat] WebSocket error:', event);
    setControlsDisabled(false);
    if (chatSend) {
      chatSend.textContent = 'Send';
    }
  };

  socket.onclose = (event) => {
    console.warn('[Chat] WebSocket closed:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      readyState: socket.readyState,
    });
  };

  const askQuestion = (event) => {
    event.preventDefault();

    const question = chatInput.value.trim();
    if (!question) {
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.warn('[Chat] WebSocket is not open yet. Current state:', socket.readyState);
      return;
    }

    messages.push({ role: 'user', content: question });
    messages.push({ role: 'assistant', content: 'Thinking...' });
    renderMessages();

    try {
      socket.send(JSON.stringify({ message: question }));
      console.log('[Chat] Message sent:', question);

      chatInput.value = '';
      setControlsDisabled(true);
      if (chatSend) {
        chatSend.textContent = '...';
      }
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      setControlsDisabled(false);
      if (chatSend) {
        chatSend.textContent = 'Send';
      }
    }
  };

  chatForm.addEventListener('submit', askQuestion);

  chatLauncher.addEventListener('click', () => {
    chatPanel.classList.toggle('hidden');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatPanel.classList.add('hidden');
    });
  }

  renderMessages();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}
