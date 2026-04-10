const backendUrl = 'https://akhtar-abbas-portfolio-backed.hf.space/api/question/';

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar = document.getElementById('navbar');
  const scrollToTopButton = document.getElementById('scroll-to-top');
  const contactForm = document.getElementById('contact-form');
  const navLinks = Array.from(document.querySelectorAll('.nav-link, .mobile-nav-link'));
  const sections = Array.from(document.querySelectorAll('section[id]'));

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

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    event.preventDefault();
    window.scrollTo({
      top: targetElement.offsetTop - 78,
      behavior: 'smooth'
    });
  });

  const updateChrome = () => {
    const offset = window.scrollY || window.pageYOffset;

    if (scrollToTopButton) {
      scrollToTopButton.classList.toggle('hidden', offset < 420);
    }

    if (navbar) {
      navbar.classList.toggle('shadow-lg', offset > 24);
    }
  };

  window.addEventListener('scroll', updateChrome, { passive: true });
  updateChrome();

  if (scrollToTopButton) {
    scrollToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const subject = document.getElementById('subject')?.value.trim() || '';
      const message = document.getElementById('message')?.value.trim() || '';
      const formMessage = document.getElementById('form-message');

      const mailtoLink = `mailto:akhtar.abbas8267@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;

      if (formMessage) {
        formMessage.className = 'p-4 rounded-lg bg-green-100 text-green-800 border border-green-300';
        formMessage.textContent = 'Opening your email client...';
        formMessage.classList.remove('hidden');
      }

      window.location.href = mailtoLink;

      setTimeout(() => {
        if (formMessage) {
          formMessage.classList.add('hidden');
        }
      }, 4500);
    });
  }

  const revealTargets = Array.from(
    document.querySelectorAll(
      'section[id], #skills .grid > div, #projects .grid > div, #testimonials .grid > div, #contact .grid > div'
    )
  );

  revealTargets.forEach((element) => element.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries.find((entry) => entry.isIntersecting);
      if (activeEntry?.target?.id) {
        setActiveNavLink(activeEntry.target.id);
      }
    },
    {
      threshold: 0.55,
      rootMargin: '-30% 0px -50% 0px'
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
  if (sections[0]?.id) {
    setActiveNavLink(sections[0].id);
  }

  const chatWidget = document.createElement('div');
  chatWidget.id = 'ai-chat-widget';
  chatWidget.innerHTML = `
    <button
      id="ai-chat-launcher"
      type="button"
      aria-label="Open CV chat"
      aria-expanded="false"
      class="fixed bottom-4 right-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition focus:outline-none focus:ring-4 focus:ring-blue-200 sm:bottom-6 sm:right-6"
    >
      <i class="fas fa-comment-dots text-2xl"></i>
    </button>

    <div id="ai-chat-overlay" class="fixed inset-0 z-[60] hidden bg-slate-950/50 backdrop-blur-sm"></div>

    <section
      id="ai-chat-panel"
      aria-label="CV chat assistant"
      class="fixed bottom-24 right-4 z-[70] hidden w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl sm:right-6 sm:w-[24rem]"
    >
      <header class="flex items-center justify-between bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white">
        <div>
          <p class="text-sm font-semibold">Ask about my CV</p>
          <p class="text-xs text-white/80">Experience, skills, projects, and more</p>
        </div>
        <button
          id="ai-chat-close"
          type="button"
          aria-label="Close CV chat"
          class="text-2xl leading-none text-white/90 transition hover:text-white"
        >
          &times;
        </button>
      </header>

      <div class="space-y-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <p>Ask me about my skills, projects, education, or contact details.</p>
      </div>

      <div id="ai-chat-messages" class="max-h-[22rem] space-y-3 overflow-y-auto px-4 py-4">
        <div class="chat-bubble assistant">
          Hi, I am the CV assistant. Ask anything about my portfolio.
        </div>
      </div>

      <form id="ai-chat-form" class="border-t border-slate-200 bg-white p-4">
        <div class="flex gap-2">
          <input
            id="ai-chat-question"
            type="text"
            placeholder="Type your question..."
            class="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm"
          />
          <button
            id="ai-chat-send"
            type="submit"
            class="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  `;
  document.body.appendChild(chatWidget);

  const chatLauncher = document.getElementById('ai-chat-launcher');
  const chatOverlay = document.getElementById('ai-chat-overlay');
  const chatPanel = document.getElementById('ai-chat-panel');
  const chatClose = document.getElementById('ai-chat-close');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-question');
  const chatSend = document.getElementById('ai-chat-send');
  const chatMessages = document.getElementById('ai-chat-messages');

  const chatState = {
    isOpen: false,
    isSending: false,
    messages: [
      {
        role: 'assistant',
        content: 'Hi, I am the CV assistant. Ask anything about my portfolio.'
      }
    ]
  };

  const renderMessages = () => {
    if (!chatMessages) return;

    chatMessages.innerHTML = '';

    chatState.messages.forEach((message) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${message.role}${message.status === 'loading' ? ' loading' : ''}`;
      bubble.setAttribute('role', 'article');

      if (message.status === 'loading') {
        bubble.innerHTML = `
          <span class="inline-flex items-center gap-2">
            <span class="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-current"></span>
            Thinking...
          </span>
        `;
      } else {
        bubble.textContent = message.content;
      }

      chatMessages.appendChild(bubble);
    });

    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  };

  const pushMessage = (message) => {
    chatState.messages.push(message);
    renderMessages();
  };

  const replaceMessage = (index, message) => {
    if (index < 0 || index >= chatState.messages.length) return;
    chatState.messages[index] = message;
    renderMessages();
  };

  const setChatOpen = (open) => {
    chatState.isOpen = open;
    chatLauncher?.setAttribute('aria-expanded', String(open));
    chatOverlay?.classList.toggle('hidden', !open);
    chatPanel?.classList.toggle('hidden', !open);
    document.body.classList.toggle('overflow-hidden', open);

    if (open) {
      chatInput?.focus();
      renderMessages();
    }
  };

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  const friendlyErrorMessage =
    'I am having trouble reaching the CV assistant right now. Please try again in a moment.';

  const askQuestion = async () => {
    if (chatState.isSending) return;

    const question = (chatInput?.value || '').trim();
    if (!question) {
      pushMessage({
        role: 'assistant',
        content: 'Please type a question first.'
      });
      return;
    }

    chatState.isSending = true;
    if (chatSend) chatSend.disabled = true;
    if (chatInput) chatInput.disabled = true;

    pushMessage({ role: 'user', content: question });
    const loadingIndex = chatState.messages.length;
    pushMessage({ role: 'assistant', content: 'Thinking...', status: 'loading' });

    if (chatInput) chatInput.value = '';

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ question }),
        mode: 'cors'
      });

      const contentType = response.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { answer: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || `Request failed with status ${response.status}`);
      }

      const answer = (data?.answer || '').trim();
      if (!answer) {
        throw new Error('Empty answer payload');
      }

      replaceMessage(loadingIndex, {
        role: 'assistant',
        content: answer
      });
    } catch (error) {
      console.error('AI CV chat error:', error);
      replaceMessage(loadingIndex, {
        role: 'assistant',
        content: friendlyErrorMessage
      });
    } finally {
      chatState.isSending = false;
      if (chatSend) chatSend.disabled = false;
      if (chatInput) chatInput.disabled = false;
      chatInput?.focus();
    }
  };

  chatLauncher?.addEventListener('click', () => {
    if (chatState.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatClose?.addEventListener('click', closeChat);
  chatOverlay?.addEventListener('click', closeChat);

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    askQuestion();
  });

  chatInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeChat();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatState.isOpen) {
      closeChat();
    }
  });

  renderMessages();
});
