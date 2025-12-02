# Averis - Business Automation & Website Solutions

A modern, responsive website showcasing business automation and rapid website development services.

## Quick Start

### Running the Development Server

To run this project locally, you can use Python's built-in HTTP server:

#### Python 3.x (Recommended)
```bash
python -m http.server 8000
```

#### Python 2.x (Legacy)
```bash
python -m SimpleHTTPServer 8000
```

#### Alternative Port
If port 8000 is already in use, you can specify a different port:
```bash
python -m http.server 3000
```

### Accessing the Website

After starting the server, open your web browser and navigate to:
```
http://localhost:8000
```

Or if you used a different port:
```
http://localhost:3000
```

## Troubleshooting

### Images Not Loading
If images aren't loading when you start the server:

1. **Check Image Paths**: Make sure all image paths in `index.html` use relative paths like `images/A.png` instead of absolute paths like `/images/A.png`
2. **Case Sensitivity**: On Linux/Mac, file names are case-sensitive. Ensure image file names match exactly
3. **File Permissions**: Make sure the images directory and files have proper read permissions
4. **Server Directory**: Always start the Python server from the project root directory (where `index.html` is located)

**Common Fix**: If you see broken images, check your HTML for paths starting with `/` and remove the leading slash:
```html
<!-- Wrong (absolute path) -->
<img src="/images/logo.png" alt="Logo">

<!-- Correct (relative path) -->
<img src="images/logo.png" alt="Logo">
```

## Project Structure

```
Averis/
├── index.html          # Main website file
├── css/
│   └── styles.css      # Stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── images/             # Image assets
└── README.md          # This file
```

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Interactive Forms**: Contact forms with validation and smooth transitions
- **Service Toggle**: Dynamic form fields based on selected service type
- **Fast Loading**: Optimized for performance and SEO

## Development

### Prerequisites
- Python 3.x (for local development server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Making Changes
1. Edit the HTML, CSS, or JavaScript files as needed
2. Refresh your browser to see changes
3. No build process required - it's a static website

### Deployment
This is a static website and can be deployed to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

© 2025 Averis. All rights reserved.