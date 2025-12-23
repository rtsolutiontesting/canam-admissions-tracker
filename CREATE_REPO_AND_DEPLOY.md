# 🚀 Create Repo and Deploy - From Terminal

## ⚠️ **Repository Doesn't Exist Yet**

We need to create the GitHub repository first. Here are two options:

---

## **Option 1: Create via Web (Fastest - 2 minutes)**

1. **Go to:** https://github.com/new
2. **Repository name:** `canam-admissions-tracker`
3. **Make it:** ✅ Public
4. **Don't check:** "Add a README file"
5. **Click:** Create repository

**Then come back here and I'll push the code!**

---

## **Option 2: Install GitHub CLI and Create from Terminal**

If you want to do everything from terminal:

```bash
# Install GitHub CLI (if not installed)
winget install --id GitHub.cli

# Then login
gh auth login

# Create repository
gh repo create canam-admissions-tracker --public --source=. --remote=origin --push
```

---

## **After Repository is Created:**

Once the repo exists, I'll push your code automatically!

**Tell me when you've created the repository, or if you want me to help install GitHub CLI!**



