# Averis - Automation & System Optimization

A professional landing page for Averis, a company specializing in custom business automation and system optimization solutions for small businesses.

## 🎯 Project Overview

Averis helps small businesses streamline their operations through custom software solutions, eliminating manual work and disconnected tools. The website showcases our modular pricing system and services.

## 🚀 Features

### Landing Page Components
- **Hero Section** - Compelling introduction with clear value proposition
- **Services Overview** - Business automation, custom software, system optimization, and AI integration
- **Modular Pricing** - "Lego-style" pricing with base system and add-on modules
- **About Section** - Company benefits and 3-step process
- **Contact Form** - Free system audit request modal
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### Technical Features
- **Modern CSS** - Gradient backgrounds, smooth animations, and professional styling
- **Interactive JavaScript** - Modal forms, smooth scrolling, and mobile navigation
- **Performance Optimized** - Lazy loading, debounced events, and efficient animations
- **Accessibility** - Proper focus states, keyboard navigation, and semantic HTML
- **Form Validation** - Client-side validation with visual feedback

## 🏗️ Project Structure

```
averis/
├── .github/
│   └── copilot-instructions.md    # Workspace-specific instructions
├── css/
│   └── styles.css                 # All styling and responsive design
├── js/
│   └── main.js                    # Interactive functionality
├── .vscode/
│   └── tasks.json                 # VS Code tasks for development
├── index.html                     # Main landing page
└── README.md                      # Project documentation
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup and accessibility
- **CSS3** - Modern styling with Flexbox, Grid, and animations
- **JavaScript (ES6+)** - Interactive features and form handling
- **Google Fonts** - Inter font family for professional typography
- **Font Awesome** - Icons for visual enhancement

## 🚀 Getting Started

### Prerequisites
- Python 3.x (for local server)
- Modern web browser
- VS Code (recommended)

### Installation & Setup

1. **Clone or download** the project to your local machine
2. **Open in VS Code** - The workspace is already configured
3. **Start the local server**:
   - Use the built-in VS Code task: "Start Local Server"
   - Or manually run: `python -m http.server 8000`
4. **View the website** at `http://localhost:8000`

### Development Workflow

The project includes a configured VS Code task for development:
- **Task: "Start Local Server"** - Runs a Python HTTP server on port 8000
- The task runs in the background, so you can continue editing while the server runs
- Access the site at `http://localhost:8000` in your browser

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adapted grid)
- **Mobile**: <768px (single column, mobile menu)

## 🎨 Customization

### Colors & Branding
The main brand colors are defined in CSS custom properties:
- **Primary Gradient**: `#667eea` to `#764ba2`
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Text**: `#1a1a1a` (headings), `#666` (body)

### Content Updates
- **Services**: Edit the services section in `index.html`
- **Pricing**: Update pricing cards with current rates
- **Contact Info**: Replace placeholder contact details
- **Company Info**: Update company description and benefits

### Adding New Sections
Follow the existing pattern:
1. Add HTML structure
2. Style with CSS classes
3. Add JavaScript interactions if needed

## 📧 Form Handling

The audit form currently:
- Validates required fields client-side
- Shows success/error notifications
- Logs form data to console (development mode)

**For Production**: Replace the form submission with actual backend integration:
```javascript
// In js/main.js, update the submitAuditForm function
fetch('/api/submit-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## 🔧 Configuration Options

### Analytics Integration
Uncomment and configure Google Analytics in `js/main.js`:
```javascript
// Replace 'GA_TRACKING_ID' with your actual tracking ID
gtag('config', 'YOUR_GA_TRACKING_ID');
```

### Performance Optimization
The site includes:
- **Lazy Loading** - Images with `data-src` attribute
- **Debounced Events** - Scroll and resize handlers
- **Intersection Observer** - Scroll animations
- **Optimized Assets** - CDN fonts and icons

## 🚀 Deployment Options

### Static Hosting (Recommended)
- **Netlify**: Drag & drop the project folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Enable in repository settings
- **AWS S3**: Upload files to S3 bucket with static website hosting

### Traditional Hosting
- Upload all files to your web hosting provider
- Ensure `index.html` is in the root directory
- No server-side processing required

## 📋 Business Context

### Service Offerings
1. **Core System** ($1,500-$4,000) - Dashboard, user management, database
2. **Automation Modules** ($500-$4,000) - Email/SMS, reports, billing
3. **CRM System** ($800-$5,000) - Contacts, pipelines, tasks
4. **AI Features** ($1,000-$10,000) - ChatGPT integration, document search
5. **E-Commerce** ($1,000-$8,000) - Payments, subscriptions, invoicing
6. **Integrations** ($500-$5,000) - QuickBooks, Slack, Shopify, etc.

### Monthly Services
- **Hosting**: $150-$800/month
- **Support Plans**: Basic ($100), Standard ($300), Premium ($800)
- **AI Usage**: $50-$500/month (usage-based)

## 🤝 Contributing

To modify or enhance the website:
1. Make changes to HTML, CSS, or JavaScript files
2. Test locally using the development server
3. Validate responsive design across devices
4. Test form functionality and animations
5. Check browser compatibility

## 📞 Support

For questions about the website or Averis services:
- **Email**: hello@averis.com (placeholder)
- **Phone**: +1 (555) 123-4567 (placeholder)
- **Website**: The site you're viewing!

## 📄 License

This project is created for Averis business purposes. All rights reserved.

---

**Built with ❤️ for small business automation**