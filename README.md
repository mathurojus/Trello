# Trello

## Overview
A full-stack Trello-like task management application built with a Node.js backend and a frontend interface for managing organizations, boards, and tasks.

## Features
- Create and manage organizations
- Board management with task tracking
- User authentication and sign-in system
- Real-time organization management
- Add members to organizations
- Create and manage multiple boards

## Tech Stack
- **Backend**: Node.js with Express
- **Frontend**: JavaScript with HTML/CSS
- **Database**: Task persistence

## Screenshots

### Create Organization
![Create Organization](Screenshot%202026-03-22%20091057.png)

### Organizations Dashboard
![Organizations Dashboard](Screenshot%202026-03-22%20091159.png)

### Sign In Page
![Sign In](Screenshot%202026-03-22%20091209.png)

### My Organizations
![My Organizations](Screenshot%202026-03-22%20091310.png)

## Project Structure
```
trello-board/
├── index.js
├── middleware.js
├── package.json
├── package-lock.json
└── .gitignore

frontend/
├── api.js
├── app.js
├── index.html
├── server.js
└── styles.css
```

## Getting Started

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Start the backend server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating an Organization
- Sign in with your credentials
- Click "+ New Organization"
- Enter organization name and description
- Submit to create

### Managing Boards
- View all your organizations
- Create new boards within an organization
- Add members to collaborate

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
MIT
