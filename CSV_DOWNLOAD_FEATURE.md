# 📥 CSV Download Feature

## ✅ **Feature Added!**

Added a "Download CSV" button to the Master Data Preview section that exports all program data with a date-stamped filename.

---

## 🎯 **Features:**

### **1. Download Button**
- Located in the "MASTER DATA PREVIEW" card header
- Green button with download icon: "📥 Download CSV"
- Click to download all program data

### **2. Date-Stamped Filename**
- Format: `admissions-data-YYYY-MM-DD-HH-MM-SS.csv`
- Example: `admissions-data-2025-12-22-14-30-00.csv`
- Automatically generated based on current date/time

### **3. CSV Columns Included:**

1. **University** - University name
2. **Program** - Program name
3. **Intake Offered** - Available intake periods
4. **Intake Status** - open / closed / waitlist / NOT_FOUND
5. **Application Deadline** - Application deadline date
6. **CAS Deadline (UK)** - CAS deadline for UK programs
7. **I-20 Deadline (USA)** - I-20 deadline for USA programs
8. **Admission Alerts/Notes** - Additional notes and alerts
9. **Change Type** - CHANGED / NEW / LOST / UNKNOWN
10. **Last Checked (ISO)** - ISO timestamp of last check

---

## 📋 **Data Source:**

The CSV export tries to get data from:
1. **Firestore** (if available) - Real program snapshots
2. **Sample Data** (fallback) - If Firestore is not available

---

## 🔧 **How It Works:**

1. **Click "Download CSV" button**
2. **Function fetches data:**
   - Tries Firestore first
   - Falls back to sample data if Firestore unavailable
3. **Formats as CSV:**
   - Escapes special characters (commas, quotes, newlines)
   - Handles null/undefined values
4. **Downloads file:**
   - Creates Blob with CSV content
   - Generates date-stamped filename
   - Triggers browser download

---

## 📊 **CSV Format:**

```csv
University,Program,Intake Offered,Intake Status,Application Deadline,CAS Deadline (UK),I-20 Deadline (USA),Admission Alerts/Notes,Change Type,Last Checked (ISO)
University of Oxford,MSc in Computer Science,Fall Spring,open,2024-12-15,2024-11-15,NOT_FOUND,Early application recommended,CHANGED,2025-12-22T14:30:00.000Z
Stanford,MS AI,Fall,open,2024-12-20,NOT_FOUND,2024-11-20,GRE required,NEW,2025-12-22T14:30:00.000Z
```

---

## ✅ **Features:**

- ✅ Date-stamped filename
- ✅ All required fields included
- ✅ Proper CSV escaping
- ✅ Handles missing data (NOT_FOUND)
- ✅ ISO timestamp format
- ✅ Change type tracking
- ✅ Works with Firestore or sample data

---

## 🚀 **Deployment:**

The feature has been:
- ✅ Added to `public/index.html`
- ✅ Committed to git
- ✅ Pushed to GitHub
- ✅ Will auto-deploy to Cloudflare Pages

**Wait 2-3 minutes for deployment, then test the download button!**

---

## 🎯 **Usage:**

1. **Run sync** to load program data
2. **Click "📥 Download CSV"** button
3. **File downloads** with date-stamped filename
4. **Open in Excel/Google Sheets** to view data

**The CSV file will be saved to your Downloads folder!**



