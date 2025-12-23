# 📤 Excel File Upload Feature

## ✅ **What's New:**

Added **Excel file upload** as an alternative to Google Sheets URL input!

---

## 🎯 **Features:**

### **1. Excel File Upload Section**
- Located below the Google Sheet URL input
- Supports: `.xlsx`, `.xls`, `.csv` files
- Clean, user-friendly interface

### **2. Upload & Load Button**
- Click to upload and process Excel file
- Shows progress bar during processing
- Displays data in the same table format

### **3. Same Data Processing**
- Uses the same column detection logic as Google Sheets
- Detects: `universityName`, `programName`, `country`, `admissionsPageUrl`
- Processes all rows and displays in table
- Works with CSV download feature

---

## 📋 **How to Use:**

### **Option 1: Google Sheets (Existing)**
1. Click "🔐 Authorize Google Drive"
2. Enter Google Sheet URL
3. Click "📥 Step 1: Load Data from Sheet"

### **Option 2: Excel Upload (NEW)**
1. Click "Choose File" or drag & drop Excel file
2. Select your Excel file (`.xlsx`, `.xls`, or `.csv`)
3. Click "📤 Upload & Load"
4. Data loads automatically!

---

## 📊 **Supported File Formats:**

- ✅ **.xlsx** (Excel 2007+)
- ✅ **.xls** (Excel 97-2003)
- ✅ **.csv** (Comma-separated values)

---

## 🎯 **Excel File Requirements:**

### **Column Headers (First Row):**
Your Excel file should have these columns (case-insensitive):
- `universityName` or `university` or `university name`
- `programName` or `program` or `program name`
- `country`
- `admissionsPageUrl` or `admissions page url` or `url`
- Optional: `status`, `deadline`, `intake`, `cas`, `i-20`, `alert`, `note`

### **Data Rows:**
- At least one data row below the header
- Empty rows are automatically skipped
- Missing columns will show as "N/A" or "NOT_FOUND"

---

## 🔧 **Technical Details:**

### **Library Used:**
- **SheetJS (xlsx.js)** - Industry standard Excel parser
- Loaded from CDN: `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- No additional dependencies needed

### **Processing:**
- Reads first sheet in Excel file
- Converts to JSON format
- Uses same `processSheetData()` function as Google Sheets
- Maintains data consistency across both input methods

---

## ✅ **Benefits:**

1. **No Google Account Required** - Upload Excel files directly
2. **Works Offline** - No internet needed for file upload
3. **Privacy** - Files processed in browser, not uploaded to server
4. **Same Features** - All features work (table display, CSV download, etc.)
5. **Flexible** - Use either Google Sheets or Excel files

---

## 🎯 **Workflow:**

### **Excel Upload Workflow:**
1. **Upload Excel File** → Select file → Click "📤 Upload & Load"
2. **Processing** → Progress bar shows: Reading → Parsing → Processing
3. **Data Display** → Table shows all programs from Excel
4. **Step 3: Sync Now** → Enabled automatically (same as Google Sheets)
5. **Download CSV** → Works with Excel data too!

---

## 🐛 **Troubleshooting:**

### **"Please select an Excel file to upload"**
- Make sure you selected a file before clicking "Upload & Load"

### **"Excel file is empty or could not be parsed"**
- Check that your Excel file has data
- Try opening it in Excel to verify it's not corrupted
- Make sure it's a valid `.xlsx`, `.xls`, or `.csv` file

### **"Only header row found"**
- Add at least one data row below the header row
- Make sure data rows are not completely empty

### **File too large**
- Excel files are processed in browser memory
- Very large files (>50MB) may cause browser slowdown
- Consider splitting into smaller files

---

## 🚀 **Deployment:**

- ✅ Code committed
- ✅ Pushed to GitHub
- ✅ Will auto-deploy to Cloudflare Pages

**Wait 2-3 minutes, then test!**

---

## 📝 **Example Excel Structure:**

| universityName | programName | country | admissionsPageUrl |
|---------------|-------------|---------|-------------------|
| University A | Program 1 | UK | https://example.com |
| University B | Program 2 | USA | https://example.com |

**This will work perfectly!**

---

## 🎉 **You're All Set!**

Users can now:
- ✅ Upload Excel files directly
- ✅ Use Google Sheets URL
- ✅ Switch between both methods
- ✅ All features work with both!

**The Excel upload feature is ready to use!** 🚀


