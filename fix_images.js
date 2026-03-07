const fs = require('fs');

const fileNames = ['index.html', 'login.css', 'menu.html', 'cart.html', 'admin.html', 'tracking.html', 'checkout.html'];

for (const name of fileNames) {
    if (fs.existsSync(name)) {
        let content = fs.readFileSync(name, 'utf8');
        // Replace all local C:/Users/... paths with an unsplash placeholder
        content = content.replace(/C:\/[a-zA-Z0-9.\/_-]+\.png/gi, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500');
        content = content.replace(/C:\/Users\/.*?\.png/gi, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500');
        // and .jpg
        content = content.replace(/C:\/[a-zA-Z0-9.\/_-]+\.jpg/gi, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500');
        content = content.replace(/file:\/\/\/C:\/.*?\.png/gi, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500');
        fs.writeFileSync(name, content);
        console.log(`Updated ${name}`);
    }
}
