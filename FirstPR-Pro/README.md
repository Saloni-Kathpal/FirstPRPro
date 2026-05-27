# FirstPR Pro - Boilerplate

A minimal starter project for helping contributors find their first pull request.

## Project Structure
- `client/`: React frontend
- `server/`: FastAPI backend

## Setup and Run

### Backend
1. Go to `server/` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `uvicorn main:app --reload`
4. Visit `https://firstprpro-1.onrender.com/docs` for API documentation.

### Frontend
1. Go to `client/` directory.
2. Install dependencies: `npm install`
3. Run the app: `npm start`
4. Visit `http://localhost:3000` to see the app.

## Project Roadmap (TODOs)
- [ ] **GitHub API Integration**: Implement `server/services/github.py` to fetch real issues.
- [ ] **Ranking Logic**: Implement `server/utils/ranking.py` to score issues based on difficulty.
- [ ] **Frontend Connection**: Update `client/src/pages/Home.js` to call the real backend API.
- [ ] **Data Processing**: Enhance backend to filter issues more effectively.
