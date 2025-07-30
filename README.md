# 🌱 Popette - Plant Watering App

A simple, beautiful web app to track your plant Popette's watering schedule. Perfect for NFC tag integration!

## Features

- **Smart Watering Schedule**: Automatically tracks Monday and Thursday watering days
- **Multi-User Support**: Multiple people can water Popette and see who watered when
- **Visual Status**: Clear indicators for when to water, waiting periods, and overdue alerts
- **Google Sheets Database**: Persistent data storage that survives deployments
- **Watering History**: View who watered Popette and when
- **Responsive Design**: Works great on mobile devices
- **Beautiful UI**: Modern, nature-inspired design with smooth animations

## How It Works

1. **Watering Schedule**: Popette should be watered on **Monday** and **Thursday**
2. **Status Display**: 
   - 🟢 **Ready**: Time to water Popette!
   - 🟡 **Waiting**: Shows how many days until next watering
   - 🔴 **Overdue**: If it's been more than 7 days since last watering
3. **Water Button**: Only active when it's time to water
4. **Data Persistence**: Uses browser localStorage to remember watering history

## Setup & Deployment

### Prerequisites
Before deploying, you need to set up Google Sheets as your database. Follow the step-by-step guide in [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).

### Option 1: Simple Local Server
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have it installed)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### Option 2: Deploy to Web Server
Simply upload these files to any web hosting service:
- `index.html`
- `styles.css`
- `script.js`

### Option 3: Deploy on Render (Recommended)
1. Push your code to a GitHub repository
2. Go to [render.com](https://render.com) and create an account
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the deployment:
   - **Name**: `popette-plant-app` (or any name you prefer)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Click "Create Web Service"
7. Your app will be deployed and available at a Render URL

### Option 4: GitHub Pages
1. Create a new GitHub repository
2. Upload these files
3. Enable GitHub Pages in repository settings
4. Your app will be available at `https://yourusername.github.io/repositoryname`

## NFC Integration

To integrate with NFC tags:
1. Program your NFC tag with the URL of your deployed app
2. When scanned, it will open the Popette watering app
3. The app will show the current watering status and allow you to log watering

## File Structure

```
popette/
├── index.html              # Main HTML file
├── admin.html              # Admin page for viewing history
├── styles.css              # Beautiful CSS styling
├── script.js               # Original client-side only version
├── script-server.js        # Server-enabled version (currently used)
├── server.js               # Express server with Google Sheets integration
├── google-sheets.js        # Google Sheets database module
├── package.json            # Node.js dependencies for Render
├── render.yaml             # Render deployment configuration
├── GOOGLE_SHEETS_SETUP.md  # Step-by-step Google Sheets setup guide
└── README.md               # This file
```

## Customization

You can easily customize the app:
- **Plant Name**: Change "Popette" in the HTML and JavaScript
- **Watering Days**: Modify the `wateringDays` array in `script.js` (0=Sunday, 1=Monday, etc.)
- **Colors**: Update the CSS variables in `styles.css`
- **Plant Emoji**: Change the plant emoji in the HTML

## Browser Compatibility

Works on all modern browsers that support:
- ES6 Classes
- LocalStorage API
- CSS Grid/Flexbox
- Modern CSS features

## License

Made with 💚 for Popette 