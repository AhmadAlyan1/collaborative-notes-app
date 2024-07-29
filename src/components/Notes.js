// src/components/Notes.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Modal } from 'react-bootstrap';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [versionHistory, setVersionHistory] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const notesCollection = collection(db, 'notes');
        const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
        });
        return () => unsubscribe();
    }, [db]);

    const handleAddNote = async () => {
        if (newNote.trim()) {
            await addDoc(collection(db, 'notes'), { text: newNote, createdAt: new Date() });
            setNewNote('');
        }
    };

    const handleEditNote = async (id, newText) => {
        const noteDoc = doc(db, 'notes', id);
        await updateDoc(noteDoc, { text: newText });
    };

    const handleDeleteNote = async (id) => {
        const noteDoc = doc(db, 'notes', id);
        await deleteDoc(noteDoc);
    };

    const handleShowModal = (note) => {
        setSelectedNote(note);
        setVersionHistory(note.history || []);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedNote(null);
    };

    const handleRevertVersion = async (version) => {
        if (selectedNote) {
            const noteDoc = doc(db, 'notes', selectedNote.id);
            await updateDoc(noteDoc, { text: version.text });
        }
    };

    return (
        <Container>
            <h2>Notes</h2>
            <Form>
                <Form.Group controlId="formNewNote">
                    <Form.Label>New Note</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter new note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAddNote}>Add Note</Button>
            </Form>
            <ListGroup className="mt-3">
                {notes.map(note => (
                    <ListGroup.Item key={note.id}>
                        <div>{note.text}</div>
                        <Button variant="link" onClick={() => handleEditNote(note.id, prompt('Edit note:', note.text))}>Edit</Button>
                        <Button variant="link" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                        <Button variant="link" onClick={() => handleShowModal(note)}>View History</Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {selectedNote && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Version History</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup>
                            {versionHistory.map((version, index) => (
                                <ListGroup.Item key={index}>
                                    {version.text}
                                    <Button variant="link" onClick={() => handleRevertVersion(version)}>Revert</Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default Notes;
