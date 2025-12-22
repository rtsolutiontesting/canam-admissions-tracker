# Alternative Hosting Solutions

Since Firebase Hosting is suspended, here are alternatives:

## Option 1: Use Different Firebase Project (Quickest)

Create a new Firebase project with a different name:

```bash
# Create new project
firebase projects:create university-admissions-tracker

# Switch to new project
firebase use university-admissions-tracker

# Deploy
firebase deploy --only hosting
```

**New URL will be:** `https://university-admissions-tracker.web.app`

## Option 2: Use Custom Domain

1. Buy a domain (e.g., `canamiapply.com`)
2. Add custom domain in Firebase Hosting
3. Deploy to custom domain

## Option 3: Alternative Hosting Platforms

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

### Cloudflare Pages
- Connect GitHub repo
- Build command: (none needed, static files)
- Output directory: `public`

## Option 4: Keep Same Project, Appeal First

1. Submit appeal (see APPEAL_PHISHING_FLAG.md)
2. Wait 24-48 hours for review
3. If approved, hosting restored
4. If denied, use alternatives above

## Recommended: New Firebase Project

**Steps:**
1. Create new Firebase project with clearer name
2. Deploy app to new project
3. Update frontend config with new project ID
4. New URL will be active immediately

**Command:**
```bash
firebase projects:create canam-admissions-tracker
firebase use canam-admissions-tracker
firebase deploy --only hosting
```

