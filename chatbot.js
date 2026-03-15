// Auto-inject Chatbot UI
(function initChatbot() {
    // 1. Inject Stylesheet
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'chatbot.css';
    document.head.appendChild(styleLink);

    // 2. Inject HTML
    const chatHTML = `
        <button class="chatbot-toggler" id="chatToggler" aria-label="Open chat">
            <i class="fas fa-comment-dots" id="chatIcon"></i>
            <i class="fas fa-times" id="chatCloseIcon" style="display:none;"></i>
        </button>
        <div class="chatbot-container" id="chatbotContainer">
            <div class="chatbot-header">
                <i class="fas fa-robot"></i>
                <div class="chatbot-header-text">
                    <h3>Sabroso Bot</h3>
                    <p>Online & Ready to Help</p>
                </div>
            </div>
            <div class="chatbot-messages" id="chatMessages">
                <div class="chat-msg bot">
                    <div class="chat-msg-text">Hi there! 👋 Welcome to Sabroso. How can I help you today?</div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off">
                <button id="sendChatBtn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatHTML;
    document.body.appendChild(wrapper);

    // 3. Logic
    const toggler = document.getElementById('chatToggler');
    const container = document.getElementById('chatbotContainer');
    const chatIcon = document.getElementById('chatIcon');
    const chatCloseIcon = document.getElementById('chatCloseIcon');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const messages = document.getElementById('chatMessages');

    let isChatOpen = false;

    toggler.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            container.classList.add('show');
            chatIcon.style.display = 'none';
            chatCloseIcon.style.display = 'block';
            chatInput.focus();
        } else {
            container.classList.remove('show');
            chatIcon.style.display = 'block';
            chatCloseIcon.style.display = 'none';
        }
    });

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User message
        addMessage(text, 'user');
        chatInput.value = '';

        // Bot typing animation setup
        const typingId = 'typing-' + Date.now();
        // Delay response
        setTimeout(() => {
            const reply = getBotReply(text.toLowerCase());
            addMessage(reply, 'bot');
        }, 600);
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = `<div class="chat-msg-text">${text}</div>`;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function getBotReply(query) {
        if (query.includes('order') || query.includes('track')) {
            return "You can easily track your order live using the tracking link we sent you via email, or by clicking the 'Track Order' button after checking out.";
        } else if (query.includes('menu') || query.includes('food') || query.includes('dish')) {
            return "Our global menu features 120+ authentic dishes! Try our European, Asian or Mexican fan favorites.";
        } else if (query.includes('delivery') || query.includes('time') || query.includes('fast')) {
            return "Our average delivery time is just 28 minutes straight to your door!";
        } else if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
            return "Hello! I am the Sabroso Bot. How can I make your experience better today?";
        } else if (query.includes('pay') || query.includes('card') || query.includes('cash')) {
            return "We accept all major credit cards, Apple Pay, Google Pay, and Cash on Delivery.";
        } else if (query.includes('thank')) {
            return "You're very welcome! Let me know if you need anything else.";
        } else {
            return "I'm still learning! If you need specific help, you can reach our human support team at hello@sabroso.com. 😊";
        }
    }

    // 4. Global Mobile Cart Sync
    function syncMobileCart() {
        try {
            const parsed = JSON.parse(localStorage.getItem('sabroso_cart') || '[]');
            const cart = parsed.filter(item => item && item.name && typeof item.price === 'number' && !isNaN(item.price));
            document.querySelectorAll('.mCartCount').forEach(el => el.textContent = cart.length);
        } catch(e) {
            document.querySelectorAll('.mCartCount').forEach(el => el.textContent = '0');
        }
    }
    
    // Initial sync
    syncMobileCart();
    
    // Sync periodically to instantly reflect clicks on "Add to Cart" anywhere
    setInterval(syncMobileCart, 800);

})();
