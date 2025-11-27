// Favicon Generator - Creates a custom favicon based on logo text
function generateFavicon() {
    // Create multiple sizes for better browser compatibility
    const sizes = [
        { width: 16, height: 16, font1: '8px', font2: '6px', y1: 7, y2: 13 },
        { width: 32, height: 32, font1: '14px', font2: '10px', y1: 12, y2: 24 },
        { width: 48, height: 48, font1: '20px', font2: '14px', y1: 18, y2: 36 },
        { width: 180, height: 180, font1: '72px', font2: '48px', y1: 70, y2: 130 }
    ];
    
    const favicons = [];
    
    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size.width;
        canvas.height = size.height;
        
        // Enable better text rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Create rounded rectangle background
        const cornerRadius = size.width / 8;
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, 0, 0, size.width, size.height, cornerRadius);
        ctx.fill();
        
        // Add subtle shadow/depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = size.width / 16;
        ctx.shadowOffsetX = size.width / 32;
        ctx.shadowOffsetY = size.width / 32;
        
        // Add highlight gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, size.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gradient;
        roundRect(ctx, 0, 0, size.width, size.height, cornerRadius);
        ctx.fill();
        
        // Reset shadow for text
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = size.width / 32;
        ctx.shadowOffsetX = size.width / 64;
        ctx.shadowOffsetY = size.width / 64;
        
        // Set text properties
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add "RO" text (Right On abbreviated)
        ctx.font = `bold ${size.font1} 'Inter', 'Arial', sans-serif`;
        ctx.fillText('RO', size.width / 2, size.y1);
        
        // Add "JR" text (Junk Removal abbreviated)  
        ctx.font = `bold ${size.font2} 'Inter', 'Arial', sans-serif`;
        ctx.fillText('JR', size.width / 2, size.y2);
        
        favicons.push({
            size: size.width,
            dataURL: canvas.toDataURL('image/png')
        });
    });
    
    // Update favicon links
    updateFaviconLinks(favicons);
}

// Helper function to create rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Update favicon links in document head
function updateFaviconLinks(favicons) {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());
    
    // Add new favicon links with multiple sizes
    const head = document.head;
    
    // Standard favicon
    const favicon16 = document.createElement('link');
    favicon16.rel = 'icon';
    favicon16.type = 'image/png';
    favicon16.sizes = '16x16';
    favicon16.href = favicons[0].dataURL;
    head.appendChild(favicon16);
    
    const favicon32 = document.createElement('link');
    favicon32.rel = 'icon';
    favicon32.type = 'image/png';
    favicon32.sizes = '32x32';
    favicon32.href = favicons[1].dataURL;
    head.appendChild(favicon32);
    
    const favicon48 = document.createElement('link');
    favicon48.rel = 'icon';
    favicon48.type = 'image/png';
    favicon48.sizes = '48x48';
    favicon48.href = favicons[2].dataURL;
    head.appendChild(favicon48);
    
    // Apple touch icon
    const appleFavicon = document.createElement('link');
    appleFavicon.rel = 'apple-touch-icon';
    appleFavicon.sizes = '180x180';
    appleFavicon.href = favicons[3].dataURL;
    head.appendChild(appleFavicon);
    
    // Shortcut icon (for older browsers)
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.href = favicons[1].dataURL;
    head.appendChild(shortcutIcon);
}

// Generate favicon when page loads
document.addEventListener('DOMContentLoaded', generateFavicon);