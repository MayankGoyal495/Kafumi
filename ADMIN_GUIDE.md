# 📋 Admin Quick Reference

## Your Daily Workflow

### 🔔 When a New Café is Submitted

**You'll receive:** A new row in your [Google Sheet](https://docs.google.com/spreadsheets/d/1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU)

### ✅ What You Need to Do

1. **Review the Submission**
   - Check if café details are complete
   - Verify photos are appropriate
   - Check menu seems reasonable

2. **Fill in Admin Columns** (AC to AH)

   | Column | Field | What to Enter | Example |
   |--------|-------|---------------|---------|
   | AC | Rating | 0 to 5 stars | `4.5` |
   | AD | Review Count | Number of reviews | `127` |
   | AE | Promoter Rating | 0 to 10 scale | `8` |
   | AF | **Approved** | `Yes` to publish, `No` to hide | `Yes` |
   | AG | Date Added | Today's date | `2024-01-20` |
   | AH | Last Updated | Today's date | `2024-01-20` |

3. **Save the Sheet**

4. **Wait 5 minutes** - Café will automatically appear on website

---

## 🎯 Important Rules

### ✅ DO:
- Set "Approved" (AF) to **"Yes"** (capital Y, lowercase es) to publish
- Use ratings 0-5 for Rating (AC)
- Use ratings 0-10 for Promoter Rating (AE)
- Check photos are family-friendly
- Verify contact details if needed

### ❌ DON'T:
- Don't edit columns A-AB (these are from the form)
- Don't delete rows
- Don't change the column order
- Don't use ratings outside 0-5 or 0-10 ranges
- Don't forget to fill ALL admin columns (AC-AH)

---

## 🔢 Column Reference (Quick View)

### Form-Filled Columns (A-AB) - **Don't Edit**
```
A: Café Name
B: Contact (Kafumi)
C: Contact (Users)
D: City
E: Address
F: Google Maps Link
G: Email
H: Instagram
I: Facebook
J: Website
K: Opening Hours
L: Closing Hours
M: Opening Days
N: Average Price
O: Price Range
P: Pure Veg (Yes/No)
Q: Short Description
R: Purpose
S: Ambience Type
T: Amenities
U: Food & Drink Types
V: Menu (JSON)
W: Best 3 Dishes
X: Cover Image Link
Y: Photo Links (separated by ||)
Z: Menu File Link
AA: Consent
AB: Submission Date
```

### Admin Columns (AC-AH) - **You Fill These**
```
AC: Rating (0-5) ⭐
AD: Review Count 📊
AE: Promoter Rating (0-10) 🎯
AF: Approved (Yes/No) ✅
AG: Date Added 📅
AH: Last Updated 🔄
```

---

## 💡 Tips for Rating Cafés

### Rating (AC) - 0 to 5 stars
- **5.0**: Exceptional - must visit
- **4.5-4.9**: Excellent - highly recommended
- **4.0-4.4**: Very good - worth visiting
- **3.5-3.9**: Good - decent option
- **3.0-3.4**: Average - okay
- **Below 3.0**: Needs improvement

### Promoter Rating (AE) - 0 to 10
This measures how likely you'd recommend it:
- **9-10**: Exceptional - I'd highly promote this
- **7-8**: Great - I'd recommend this
- **5-6**: Good - I might recommend this
- **3-4**: Okay - I wouldn't actively recommend
- **0-2**: Poor - I wouldn't recommend

---

## 🔍 How to Check if a Café is Live

1. Open: `http://localhost:3000/browse` (or your production URL)
2. Look for the café name
3. If not visible after 5 minutes:
   - Check column AF is exactly "Yes"
   - Check all admin columns are filled
   - Try refreshing the page

---

## 📸 Photo Quality Guidelines

When reviewing photos (column Y), ensure:
- ✅ Photos are clear and well-lit
- ✅ Show ambience, food, or interior
- ✅ Are appropriate for all audiences
- ✅ Represent the café accurately
- ❌ Not blurry or poorly framed
- ❌ Not copyrighted from other sources
- ❌ Not unrelated to the café

---

## 🚨 Common Mistakes to Avoid

1. **Typo in "Approved" column**
   - ✅ Correct: `Yes` (capital Y)
   - ❌ Wrong: `yes`, `YES`, `Y`, `True`

2. **Rating out of range**
   - ✅ Rating (AC): 0-5
   - ✅ Promoter (AE): 0-10
   - ❌ Don't use 10/10 for Rating column

3. **Forgetting to fill all columns**
   - Must fill AC, AD, AE, AF, AG, AH
   - Even if review count is 0, put `0`

4. **Editing form data**
   - Don't change columns A-AB
   - If data is wrong, contact café owner

---

## 🆘 Emergency Actions

### To Hide a Café Immediately
Change column AF to `No`

### To Update Café Info
1. Never edit columns A-AB directly
2. Contact café owner to resubmit
3. Or manually update and note in a separate tracking sheet

### If Photos Don't Load
1. Check column Y has links
2. Verify links start with `https://drive.google.com`
3. Test clicking one link - should open in browser
4. If needed, re-upload to [Drive folder](https://drive.google.com/drive/folders/1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS)

---

## 📞 Quick Links

- **Google Sheet**: [Open Sheet](https://docs.google.com/spreadsheets/d/1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU)
- **Google Drive**: [Open Folder](https://drive.google.com/drive/folders/1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS)
- **Submission Form**: `http://localhost:3000/submit-cafe`
- **Browse Cafés**: `http://localhost:3000/browse`

---

## ✅ Daily Checklist

Morning routine:
- [ ] Check Google Sheet for new submissions
- [ ] Review photos in Drive folder
- [ ] Fill admin columns (AC-AH)
- [ ] Set Approved = "Yes" for valid cafés
- [ ] Save sheet
- [ ] Check website after 5 minutes

---

## 📊 Example Completed Row

```
A: Brew & Chew Café
B: 9876543210
C: 9876543211
D: Bangalore
E: 123 MG Road, Indiranagar
F: https://maps.google.com/?q=12.97,77.59
... (form fills other columns)
AC: 4.5           ← YOU FILL THIS
AD: 156           ← YOU FILL THIS
AE: 8             ← YOU FILL THIS
AF: Yes           ← YOU FILL THIS (exact spelling!)
AG: 2024-01-20    ← YOU FILL THIS
AH: 2024-01-20    ← YOU FILL THIS
```

---

## 💬 Need Help?

If something doesn't work:
1. Check this guide first
2. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. Check [GOOGLE_SHEETS_STRUCTURE.md](./GOOGLE_SHEETS_STRUCTURE.md)
4. Contact technical team

**Remember**: Once you set Approved = "Yes", the café will be live on the website within 5 minutes! 🚀
