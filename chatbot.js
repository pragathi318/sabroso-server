// Auto-inject Chatbot UI
(function initChatbot() {
    // 1. Inject Stylesheet
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'chatbot.css';
    document.head.appendChild(styleLink);

    // 2. Inject HTML
    const chatHTML = `
        <button class="chatbot-toggler" id="chatbotToggle" aria-label="Open chat">
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
                <button class="chatbot-close" id="chatbotClose"><i class="fas fa-times"></i></button>
            </div>
            <div class="chatbot-messages" id="chatMessages">
                <div class="chat-msg bot">
                    <div class="chat-msg-text">Hi there! Welcome to Sabroso. How can I help you today?</div>
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
    const toggler = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    const chatIcon = document.getElementById('chatIcon');
    const chatCloseIcon = document.getElementById('chatCloseIcon');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const messages = document.getElementById('chatMessages');

    let isChatOpen = false;

    function openChat() {
        isChatOpen = true;
        container.classList.add('show');
        chatIcon.style.display = 'none';
        chatCloseIcon.style.display = 'block';
        chatInput.focus();
    }

    function closeChat() {
        isChatOpen = false;
        container.classList.remove('show');
        chatIcon.style.display = 'block';
        chatCloseIcon.style.display = 'none';
    }

    toggler.addEventListener('click', () => {
        if (isChatOpen) closeChat();
        else openChat();
    });

    // Close button in header
    const closeBtn = document.getElementById('chatbotClose');
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // Expose openChat globally for Live Chat links
    window.openSabrosoChatbot = openChat;

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

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

    // Random picker helper
    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getBotReply(query) {
        // Greetings
        if (/^(hi|hello|hey|hii+|hola|namaste|good morning|good evening|good afternoon)/.test(query)) {
            return pickRandom([
                "Hello! Welcome to Sabroso. What can I help you with today?",
                "Hey there! Great to see you. Looking for something delicious?",
                "Hi! I'm here to help. Ask me about our menu, orders, or delivery!",
                "Namaste! How can I assist you today?"
            ]);
        }

        // Special/Features/Best
        if (query.includes('special') || query.includes('spcl') || query.includes('unique') || query.includes('best') || query.includes('feature') || query.includes('why')) {
            return pickRandom([
                "What makes Sabroso special?<br>• 120+ authentic dishes from 30+ countries<br>• Home-style recipes, restaurant quality<br>• Fast delivery in 25-35 mins<br>• Free delivery on orders above ₹500!",
                "Sabroso brings the world to your plate!<br>• Global cuisines: Italian, Japanese, Korean, Mexican, African<br>• Fresh ingredients, authentic flavors<br>• Easy ordering & live tracking<br>• Save favorites to your Wishlist!",
                "Our specialties:<br>• Tonkotsu Ramen - rich pork broth perfection<br>• Spaghetti Bolognese - classic Italian comfort<br>• Chicken Tacos - spicy Mexican favorite<br>• Sushi Platter - fresh Japanese delight"
            ]);
        }

        // Recommend/Suggest
        if (query.includes('recommend') || query.includes('suggest') || query.includes('popular') || query.includes('famous') || query.includes('top') || query.includes('trending')) {
            return pickRandom([
                "Our top sellers:<br>1. Spaghetti Bolognese (4.9★)<br>2. Tonkotsu Ramen (4.9★)<br>3. Margherita Pizza (4.9★)<br>4. Sushi Platter (4.8★)<br>5. Chicken Tacos (4.8★)",
                "Customer favorites: Tonkotsu Ramen, Bibimbap Bowl & Churros! All highly rated!",
                "Can't decide? Try our Margherita Pizza or the famous Sushi Platter - both are crowd pleasers!"
            ]);
        }

        // Menu & Food
        if (query.includes('menu') || query.includes('food') || query.includes('dish') || query.includes('eat') || query.includes('cuisine')) {
            return pickRandom([
                "We have 120+ dishes from 30+ countries! Check out our <a href='menu.html'>Menu</a> to explore.",
                "From Italian pasta to Japanese sushi, Korean bibimbap to Mexican tacos - we've got it all! Visit our <a href='menu.html'>Menu</a>.",
                "Hungry? Browse our global menu featuring European, Asian, Mexican & African cuisines. <a href='menu.html'>See Menu</a>",
                "Our chef's specials include Tonkotsu Ramen, Spaghetti Bolognese & Chicken Tacos. <a href='menu.html'>Explore now</a>!"
            ]);
        }

        // Specific cuisines
        if (query.includes('italian') || query.includes('pasta') || query.includes('pizza')) {
            return "Our Italian favorites include Spaghetti Bolognese, Margherita Pizza & Mushroom Risotto. All made with authentic recipes!";
        }
        if (query.includes('japanese') || query.includes('sushi') || query.includes('ramen')) {
            return "Try our Sushi Platter, Tonkotsu Ramen or Tempura Udon - straight from Japanese traditions!";
        }
        if (query.includes('korean') || query.includes('bibimbap') || query.includes('kimchi')) {
            return "Korean food lovers enjoy our Bibimbap Bowl and spicy Kimchi Jjigae. Perfect comfort food!";
        }
        if (query.includes('mexican') || query.includes('taco') || query.includes('churro')) {
            return "Our Mexican selection includes Chicken Tacos and Churros & Chocolate. Delicioso!";
        }
        if (query.includes('african') || query.includes('jollof')) {
            return "Explore African flavors with our Jollof Rice and Moambe Chicken. Authentic and hearty!";
        }

        // Order & Tracking
        if (query.includes('track') || query.includes('where is my order') || query.includes('order status')) {
            return "Track your order anytime at <a href='tracking.html'>Order Tracking</a>. You'll also receive updates via email!";
        }
        if (query.includes('order') || query.includes('how to order') || query.includes('place order')) {
            return pickRandom([
                "Ordering is easy! Browse our <a href='menu.html'>Menu</a>, add items to cart, and checkout. We'll handle the rest!",
                "Simply pick your dishes, add to cart, enter your address and pay. Your food arrives in about 30 mins!",
                "Go to Menu > Add dishes to Cart > Checkout > Enjoy! It's that simple."
            ]);
        }

        // Delivery
        if (query.includes('delivery') || query.includes('how long') || query.includes('time') || query.includes('fast') || query.includes('deliver')) {
            return pickRandom([
                "Average delivery time is 25-35 minutes. We prioritize hot, fresh food at your doorstep!",
                "Most orders arrive within 30 minutes. You can track your rider in real-time!",
                "We deliver quickly! Expect your order in about 25-35 mins depending on your location."
            ]);
        }
        if (query.includes('delivery fee') || query.includes('delivery charge') || query.includes('shipping')) {
            return "Delivery is FREE on orders above ₹500! For smaller orders, a flat ₹49 delivery fee applies.";
        }
        if (query.includes('area') || query.includes('location') || query.includes('where do you deliver') || query.includes('city')) {
            return "We currently deliver across Hyderabad. Enter your address at checkout to confirm availability!";
        }

        // Payment
        if (query.includes('pay') || query.includes('card') || query.includes('cash') || query.includes('upi') || query.includes('payment')) {
            return pickRandom([
                "We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).",
                "Pay your way! UPI, cards, wallets, or cash - all payment methods accepted.",
                "Flexible payments: UPI (GPay, PhonePe), Cards, or pay Cash on Delivery."
            ]);
        }

        // Pricing
        if (query.includes('price') || query.includes('cost') || query.includes('expensive') || query.includes('cheap') || query.includes('budget')) {
            return "Our dishes range from ₹649 to ₹1399. Use the price filter on our <a href='menu.html'>Menu</a> to find dishes in your budget!";
        }

        // Offers & Discounts
        if (query.includes('offer') || query.includes('discount') || query.includes('coupon') || query.includes('promo')) {
            return "Check our homepage for current offers! Free delivery on orders above ₹500. Subscribe to our newsletter for exclusive deals.";
        }

        // Vegetarian/Diet
        if (query.includes('veg') || query.includes('vegetarian')) {
            return "We have delicious vegetarian options! Try Mushroom Risotto, Bibimbap Bowl (veg version), or Margherita Pizza. Use the Veg filter on our menu!";
        }
        if (query.includes('non-veg') || query.includes('nonveg') || query.includes('chicken') || query.includes('meat')) {
            return "Non-veg lovers enjoy our Chicken Tacos, Moambe Chicken, Tonkotsu Ramen & more! Filter by Non-Veg on our menu.";
        }
        if (query.includes('spicy') || query.includes('spice')) {
            return "Love spice? Try our Kimchi Jjigae (Hot) or Chicken Tacos. Each dish shows its spice level!";
        }

        // Wishlist/Favorites
        if (query.includes('wishlist') || query.includes('favorite') || query.includes('save')) {
            return "Click the heart icon on any dish to save it! View all your favorites on the <a href='wishlist.html'>Wishlist</a> page.";
        }

        // Cart
        if (query.includes('cart') || query.includes('basket') || query.includes('checkout')) {
            return "View and manage your cart by clicking the Cart button in the top navigation. Checkout when you're ready!";
        }

        // Contact & Support
        if (query.includes('contact') || query.includes('support') || query.includes('help') || query.includes('call') || query.includes('phone')) {
            return "Reach us at:<br>📞 +91 93811 48438<br>📧 blessybloommail0511@gmail.com<br>💬 WhatsApp: <a href='https://wa.me/919381148438'>Chat Now</a>";
        }
        if (query.includes('email') || query.includes('mail')) {
            return "Email us at blessybloommail0511@gmail.com - we respond within 24 hours!";
        }
        if (query.includes('whatsapp')) {
            return "Chat with us on WhatsApp: <a href='https://wa.me/919381148438'>+91 93811 48438</a>";
        }

        // Account/Login
        if (query.includes('login') || query.includes('sign in') || query.includes('account') || query.includes('register') || query.includes('sign up')) {
            return "Create an account or login <a href='login.html'>here</a> to track orders and save your favorites!";
        }

        // Refund/Cancel
        if (query.includes('refund') || query.includes('cancel') || query.includes('return')) {
            return "For order cancellation or refund, please contact us immediately at +91 93811 48438. Refunds are processed within 3-5 business days.";
        }

        // Hours/Timing
        if (query.includes('hour') || query.includes('open') || query.includes('close') || query.includes('timing')) {
            return "We're open daily from 10:00 AM to 11:00 PM. Order anytime within these hours!";
        }

        // About
        if (query.includes('about') || query.includes('who are you') || query.includes('what is sabroso')) {
            return "Sabroso is a Global Cloud Kitchen bringing authentic cuisines from 30+ countries to your doorstep. Home-style cooking, restaurant quality!";
        }

        // Thanks
        if (query.includes('thank') || query.includes('thanks') || query.includes('thx')) {
            return pickRandom([
                "You're welcome! Enjoy your meal!",
                "Happy to help! Let me know if you need anything else.",
                "Anytime! Have a delicious day!",
                "My pleasure! Bon appétit!"
            ]);
        }

        // Bye
        if (query.includes('bye') || query.includes('goodbye') || query.includes('see you')) {
            return pickRandom([
                "Goodbye! Come back hungry!",
                "See you soon! Enjoy your food!",
                "Take care! Order again anytime!"
            ]);
        }

        // Default fallback
        return pickRandom([
            "I'm not sure about that. Try asking about our menu, delivery, payment, or contact us at +91 93811 48438!",
            "Hmm, I didn't catch that. Ask me about dishes, orders, delivery times, or payment options!",
            "I'm still learning! You can also reach our team at blessybloommail0511@gmail.com for specific queries.",
            "Not sure I understood. Try: 'Show menu', 'Delivery time', 'Payment options', or 'Contact support'."
        ]);
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
