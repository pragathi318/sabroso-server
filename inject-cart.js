const fs = require('fs');
const files = ['index.html', 'menu.html', 'details.html', 'checkout.html', 'cart.html', 'tracking.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Only add if not already added
    if (!content.includes('mobile-cart-btn')) {
        content = content.replace(
            /(<div class="hamburger".*?>)/,
            '<a href="cart.html" class="mobile-cart-btn"><i class="fas fa-shopping-cart"></i><span class="mCartCount">0</span></a>\n        $1'
        );
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}
