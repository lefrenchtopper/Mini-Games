# MiniHub Dashboard

rontend-only foundation for the MiniHub arcade project.

Open a PowerShell terminal in `frontend` and run:

```powershell
python -m http.server 5500
```

Then visit:

http://localhost:5500

## Important

MongoDB Atlas is NOT connected to this package yet.

The intended production architecture is:

Browser -> FastAPI -> MongoDB Atlas

Never put the MongoDB connection string in frontend JavaScript.

## Current status

- Full frontend folder structure
- Working navigation
- Styled home page
- Login/signup demo using localStorage only
- Dashboard/profile/leaderboard pages
- Fully working Snake browser game
- Placeholder pages for the remaining modules

The remaining game logic can be migrated from the existing projects next.
