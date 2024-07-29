import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavBar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Notes from './components/Notes';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [auth]);

    return (
        <Router>
            <NavBar />
            <Container className="mt-4">
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/notes" /> : <Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" />} />
                    <Route path="/" element={<h1>Welcome to Collaborative Note-Taking App</h1>} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;
