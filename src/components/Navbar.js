// src/components/NavBar.js
import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const NavBar = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Redirect to login page after sign out
            window.location.href = '/login';
        } catch (error) {
            alert('Error signing out: ' + error.message);
        }
    };

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand as={Link} to="/">Collaborative Note-Taking App</Navbar.Brand>
            <Nav className="ml-auto">
                {user ? (
                    <>
                        <Nav.Link as={Link} to="/notes">Notes</Nav.Link>
                        <Button variant="outline-danger" onClick={handleSignOut}>Sign Out</Button>
                    </>
                ) : (
                    <>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    </>
                )}
            </Nav>
        </Navbar>
    );
};

export default NavBar;
