# 🌱 Google Sheets Setup for Popette

Follow these steps to set up Google Sheets as your database:

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Popette Watering Log"
4. **Copy the URL** - you'll need the spreadsheet ID from it

## Step 2: Get the Spreadsheet ID

From your Google Sheet URL, copy the ID:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit


The part between `/d/` and `/edit` is your spreadsheet ID.

## Step 3: Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 4: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - **Name**: `popette-app`
   - **Description**: `Service account for Popette watering app`
4. Click "Create and Continue"
5. Skip the optional steps, click "Done"

## Step 5: Generate JSON Key

1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. **Download the JSON file** - this is your credentials

## Step 6: Share the Google Sheet

1. Go back to your Google Sheet
2. Click "Share" button
3. Add your service account email (found in the JSON file)
4. Give it **Editor** permissions
5. Click "Send"

## Step 7: Set up Environment Variables

### For Local Development:
Create a `.env` file in your project root:
```
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

### For Render Deployment:
1. **Format your credentials** (run this locally):
   ```bash
   node format-credentials.js
   ```
   This will give you the properly formatted JSON to copy.

2. Go to your Render service settings
3. Add these environment variables:
   - `GOOGLE_SHEET_ID`: Your spreadsheet ID
   - `GOOGLE_APPLICATION_CREDENTIALS`: **Copy and paste the entire JSON content** from the script output
   
   **Important**: The JSON should be on a single line with no line breaks.

## Step 8: Add Credentials File

1. Rename your downloaded JSON file to `credentials.json`
2. Place it in your project root (same folder as `server.js`)
3. **Add it to .gitignore** (already done)

## Step 9: Test Locally

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Visit: `http://localhost:3000`
4. Try watering Popette!

## Step 10: Deploy to Render

1. Push your code to GitHub
2. Deploy on Render with the environment variables set
3. Your app will now use Google Sheets as the database!

## Troubleshooting

### "Permission denied" error:
- Make sure you shared the Google Sheet with the service account email
- Check that the service account has Editor permissions

### "Invalid credentials" error:
- Verify your JSON credentials file is correct
- Make sure the Google Sheets API is enabled

### "Spreadsheet not found" error:
- Check your `GOOGLE_SHEET_ID` environment variable
- Make sure the spreadsheet ID is correct

## What the Sheet Will Look Like

Your Google Sheet will have a sheet named "Popette" with these columns:
- **A**: Date (e.g., "12/25/2024")
- **B**: User (e.g., "John")
- **C**: Timestamp (e.g., "2024-12-25T10:30:00.000Z")

The app will automatically:
- ✅ Create the "Popette" sheet if it doesn't exist
- ✅ Add headers (Date, User, Timestamp)
- ✅ Manage all the data for you

## Benefits

✅ **Persistent data** - survives Render deployments  
✅ **Free forever** - Google Sheets is free  
✅ **Easy to view** - check the sheet anytime  
✅ **Multi-user** - multiple people can water Popette  
✅ **Reliable** - Google's infrastructure  

Your Popette app is now ready for production! 🌱💧 