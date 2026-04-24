# FoundIt - Pre-Launch Checklist

## Environment Setup
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 14+ installed (`node --version`)
- [ ] MongoDB running locally or connection string ready
- [ ] `.env` file created in root with all variables:
  - `MONGODB_URL`
  - `JWT_SECRET`
  - `EMAIL_PASSWORD`
  - `CLOUDINARY_*` keys
- [ ] `frontend/.env` created with `VITE_API_BASE_URL=http://localhost:8000`

## Installation
- [ ] Run `pip install -r requirements.txt` in backend
- [ ] Run `npm install` in frontend
- [ ] No installation errors in console

## Backend Verification
- [ ] Backend starts: `python -m uvicorn server:app --reload --port 8000`
- [ ] No Python errors on startup
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:8000/docs (Swagger UI)
- [ ] All imports load correctly

## Frontend Verification
- [ ] Frontend starts: `npm start` in frontend directory
- [ ] Starts on port 3000
- [ ] Can access http://localhost:3000
- [ ] No JavaScript errors in console (F12)
- [ ] Page loads and renders correctly
- [ ] All fonts and styles load

## Feature Testing
### Authentication
- [ ] Sign up page loads
- [ ] Can enter email and password
- [ ] Sign up button is clickable
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Confirm password validation works
- [ ] Can click "Continue"
- [ ] OTP page loads
- [ ] OTP input fields appear
- [ ] OTP verification works
- [ ] Login page accessible
- [ ] Login form functional

### Items Feed
- [ ] Feed page loads
- [ ] Sample items display
- [ ] Can switch between Lost/Found tabs
- [ ] Item cards show properly
- [ ] Categories display correctly
- [ ] Can click on items
- [ ] Item detail modal opens

### Posting Items
- [ ] Post button accessible
- [ ] Can select Lost or Found
- [ ] Can select category
- [ ] Can upload image
- [ ] Image preview shows
- [ ] Can enter description
- [ ] Can enter location
- [ ] Date picker works
- [ ] Can submit form

### Messaging
- [ ] Chat view accessible
- [ ] Can start conversations
- [ ] Can type messages
- [ ] Messages send successfully
- [ ] Messages display in feed

### UI/UX
- [ ] Theme toggle works (dark/light)
- [ ] Mobile responsive (test with F12)
- [ ] Notifications display
- [ ] All buttons are clickable
- [ ] No layout breaks
- [ ] Text is readable

## API Endpoints Testing

### Use curl or Postman:

```bash
# Health check
curl http://localhost:8000/health

# Get all items
curl http://localhost:8000/items

# Get lost items
curl http://localhost:8000/items/lost

# Get found items
curl http://localhost:8000/items/found

# Swagger UI
curl http://localhost:8000/docs
```

## Performance Testing
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Network requests complete
- [ ] API responses are timely

## Browser Testing
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari (if Mac) ✅
- [ ] Edge (if Windows) ✅

## Mobile Testing
- [ ] Responsive on mobile width
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] All buttons accessible

## Database Testing
- [ ] MongoDB connection successful
- [ ] Collections created automatically
- [ ] Can read test data
- [ ] Can write new data

## Final Checks
- [ ] Both terminal windows show no errors
- [ ] Browser console shows no red errors
- [ ] All pages load and render
- [ ] Features respond to user input
- [ ] No crashes when clicking buttons
- [ ] API documentation accessible

## Troubleshooting if Issues Found

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process or use different port |
| Port 8000 already in use | Kill process or use different port |
| MongoDB connection fails | Check MONGODB_URL in .env |
| CORS errors | Ensure backend is running on 8000 |
| Module not found | Run pip install or npm install again |
| .env not being read | Verify file is in correct directory |
| Images not uploading | Check Cloudinary credentials |
| Emails not sending | Check EMAIL_PASSWORD and Gmail settings |

## Deployment Ready
- [ ] All features tested locally
- [ ] No console errors
- [ ] No breaking bugs found
- [ ] Ready for staging/production

---

**Checklist Status**: [ ] Complete

Run through this checklist before considering the application production-ready!
