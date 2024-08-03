import React, { useState } from 'react';
import {createUserWithEmailAndPassword } from 'firebase/auth';
import { Container, Form, Button } from 'react-bootstrap';
import { auth } from '../firebaseConfig'; // Ensure correct import
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Registration successful!');
            navigate('/notes'); // Navigate to /notes after successful registration
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <Container>
            <h2>Register</h2>
            <Form onSubmit={handleRegister}>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Register
                </Button>
            </Form>
        </Container>
    );
};

export default Register;
