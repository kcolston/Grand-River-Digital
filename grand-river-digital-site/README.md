# Grand River Digital — Website Package
Built: March 2026

## File Structure
```
/
├── index.html              Public landing page
├── portal.html             Client login portal
├── workflow.html            Your internal operations guide
├── 404.html                Error page
└── admin/
    ├── index.html          Password login gate (owner only)
    └── dashboard.html      Agency dashboard (password protected)
```

## Your URLs (after domain setup)
| Page | URL |
|------|-----|
| Landing page | grandriverdigital.com |
| Client portal | grandriverdigital.com/portal.html |
| Ops workflow | grandriverdigital.com/workflow.html |
| Dashboard login | grandriverdigital.com/admin/ |
| Your email | hello@grandriverdigital.com |

## Dashboard Access
- URL: **grandriverdigital.com/admin/**
- Password: **grd2026admin**
- The dashboard is NOT linked anywhere on the public site
- Bookmark /admin/ after logging in
- Session stays active until you close the browser tab
- Logout button is in the dashboard top bar

## Changing the Password
1. Open admin/index.html and admin/dashboard.html in any text editor
2. Generate new SHA-256 hash: https://emn178.github.io/online-tools/sha256.html
3. Replace the H= value in BOTH files with your new hash
4. Re-upload both files to GitHub

## Upload to GitHub Pages
1. Go to github.com → create free account
2. New repository → name it: **yourusername.github.io** (must be Public)
3. Upload ALL files — keep the admin/ folder structure intact
4. Settings → Pages → Source: main branch → root /
5. Your site is live at yourusername.github.io in ~2 minutes

## Connect grandriverdigital.com (Namecheap DNS)
Buy domain at namecheap.com, then add these DNS records:

**A Records (Host: @)**
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153

**CNAME Record**
  Host: www → Value: yourusername.github.io

Then in GitHub: Settings → Pages → Custom domain → enter grandriverdigital.com
Enable "Enforce HTTPS" once it appears (10-30 min after DNS setup)

## Google Workspace Email (hello@grandriverdigital.com)
1. workspace.google.com → Start free trial → enter grandriverdigital.com
2. Google gives you MX records → add them in Namecheap DNS
3. Your inbox is live at mail.google.com ($6/mo)

## localStorage Keys Used
The site uses these browser storage keys (all prefixed grd_):
- grd_admin          Session auth token
- grd_new_clients    Landing page form submissions → dashboard
- grd_seen_ids       Tracks which signups you've dismissed
- grd_booked_slots   Callback time slot bookings

## Color Palette
Primary blue: #1a56db (links, buttons, accents)
Amber gold:   #f59e0b (highlights, Detroit nod)
Dark bg:      #0d1117 (landing page)
Light bg:     #f3f4f6 (portal, dashboard)
