import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup } from 'react-bootstrap';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Notebooks = ({ onSelectNotebook }) => {
    const [notebooks, setNotebooks] = useState([]);
    const [newNotebook, setNewNotebook] = useState('');

    useEffect(() => {
        const notebooksCollection = collection(db, 'notebooks');
        const unsubscribe = onSnapshot(notebooksCollection, (snapshot) => {
            const notebooksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotebooks(notebooksData);
        });
        return () => unsubscribe();
    }, []);

    const handleAddNotebook = async () => {
        if (newNotebook.trim()) {
            await addDoc(collection(db, 'notebooks'), { name: newNotebook });
            setNewNotebook('');
        }
    };

    return (
        <Container>
            <h2>Notebooks</h2>
            <Form>
                <Form.Group controlId="formNewNotebook">
                    <Form.Label>New Notebook</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter new notebook"
                        value={newNotebook}
                        onChange={(e) => setNewNotebook(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAddNotebook}>Add Notebook</Button>
            </Form>
            <ListGroup className="mt-3">
                {notebooks.map(notebook => (
                    <ListGroup.Item key={notebook.id} onClick={() => onSelectNotebook(notebook)}>
                        {notebook.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default Notebooks;
