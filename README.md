# Collaborative Note-Taking App

This is a collaborative note-taking application built with React and Firebase. It allows users to create, edit, and delete notebooks and notes, as well as view the version history of notes and notebooks.

## Features

- User authentication with Firebase
- Create, edit, and delete notebooks
- Add, edit, and delete notes within notebooks
- View version history for both notes and notebooks
- Revert to previous versions of notes and notebooks

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (https://nodejs.org/)
- npm (Node Package Manager, comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/collaborative-notes-app.git
cd collaborative-notes-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a Firebase project and set up Firestore and Authentication.

4. Create a `firebaseConfig.js` file in the `src` directory and add your Firebase configuration:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
```
### Usage

To start the development server, run:

```bash
npm start
```

This will launch the app in your default web browser at `http://localhost:3000`.

## Components Created

### Authentication

- **Login.js**: Manages user login forms.
- **Register.js**: Manages user registration forms.

### Note and Notebooks Management

- **AddNotebookModal.js**: Handles adding new notebooks.
- **EditNotebookModal.js**: Manages editing existing notebooks.
- **NotebookHistoryModal.js**: Displays the history of changes to a notebook.
- **NoteModal.js**: Displays and manages individual notes.
- **EditNoteModal.js**: Handles editing notes.
- **NotebookList.js**: Displays a list of notebooks.
- **NoteList.js**: Displays a list of notes within a notebook.
- **Notes.js**: Displays and manages all notes.

### UI

- **Navbar.js**: Provides navigation across the app.

## Features

- User authentication (login and registration)
- Create, edit, and delete notebooks
- Add, edit, and delete notes within notebooks
- View version history of notebooks and notes
- Revert to previous versions of notebooks and notes
- User-specific data management