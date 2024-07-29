import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Modal } from 'react-bootstrap';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, getDocs } from 'firebase/firestore';

const Notes = () => {
    const [notebooks, setNotebooks] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState(null);
    const [notebookNotes, setNotebookNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [versionHistory, setVersionHistory] = useState([]);
    const [notebookHistory, setNotebookHistory] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showNotebookModal, setShowNotebookModal] = useState(false);
    const [showEditNotebookModal, setShowEditNotebookModal] = useState(false);
    const [showNotebookHistoryModal, setShowNotebookHistoryModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [newNotebookName, setNewNotebookName] = useState('');
    const [editNotebookId, setEditNotebookId] = useState(null);
    const [notebookToEdit, setNotebookToEdit] = useState('');
    const [revertVersion, setRevertVersion] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const notebooksCollection = collection(db, 'notebooks');
        const unsubscribe = onSnapshot(notebooksCollection, (snapshot) => {
            const notebooksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotebooks(notebooksData);
        });
        return () => unsubscribe();
    }, [db]);

    useEffect(() => {
        if (selectedNotebook) {
            const notesCollection = collection(db, 'notebooks', selectedNotebook.id, 'notes');
            const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
                const notesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotebookNotes(notesData);
            });
            return () => unsubscribe();
        }
    }, [selectedNotebook, db]);

    const handleAddNote = async () => {
        if (newNote.trim() && selectedNotebook) {
            await addDoc(collection(db, 'notebooks', selectedNotebook.id, 'notes'), {
                text: newNote,
                createdAt: new Date()
            });
            setNewNote('');
        }
    };

    const handleEditNote = async (id, newText) => {
        if (selectedNotebook) {
            const noteDoc = doc(db, 'notebooks', selectedNotebook.id, 'notes', id);
            const noteSnapshot = await getDoc(noteDoc);
            const noteData = noteSnapshot.data();

            if (noteData) {
                const updatedHistory = [
                    ...(noteData.history || []),
                    { text: noteData.text, timestamp: new Date() }
                ];
                await updateDoc(noteDoc, { text: newText, history: updatedHistory });
            }
        }
    };

    const handleDeleteNote = async (id) => {
        if (selectedNotebook) {
            const noteDoc = doc(db, 'notebooks', selectedNotebook.id, 'notes', id);
            await deleteDoc(noteDoc);
        }
    };

    const handleShowNoteModal = (note) => {
        setSelectedNote(note);
        setVersionHistory(note.history || []);
        setShowNoteModal(true);
    };

    const handleCloseNoteModal = () => {
        setShowNoteModal(false);
        setSelectedNote(null);
    };

    const handleRevertVersion = async (version) => {
        if (selectedNote) {
            const noteDoc = doc(db, 'notebooks', selectedNotebook.id, 'notes', selectedNote.id);
            await updateDoc(noteDoc, { text: version.text });
        }
    };

    const handleAddNotebook = async () => {
        if (newNotebookName.trim()) {
            await addDoc(collection(db, 'notebooks'), {
                name: newNotebookName,
                history: []
            });
            setNewNotebookName('');
            setShowNotebookModal(false);
        }
    };

    const handleEditNotebook = async () => {
        if (editNotebookId && notebookToEdit.trim()) {
            const notebookDoc = doc(db, 'notebooks', editNotebookId);
            const notebookSnapshot = await getDoc(notebookDoc);
            const notebookData = notebookSnapshot.data();

            if (notebookData) {
                const updatedHistory = [
                    ...(notebookData.history || []),
                    { name: notebookData.name, timestamp: new Date() }
                ];
                await updateDoc(notebookDoc, { name: notebookToEdit, history: updatedHistory });
            }

            setNotebookToEdit('');
            setEditNotebookId(null);
            setShowEditNotebookModal(false);
        }
    };

    const handleDeleteNotebook = async (id) => {
        if (window.confirm("Are you sure you want to delete this notebook?")) {
            try {
                const notebookDoc = doc(db, 'notebooks', id);
                const notesCollection = collection(db, 'notebooks', id, 'notes');
                const notesSnapshot = await getDocs(notesCollection);
                notesSnapshot.docs.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
                await deleteDoc(notebookDoc);
                setSelectedNotebook(null); // Clear selection after deletion
            } catch (error) {
                console.error("Error deleting notebook: ", error);
            }
        }
    };

    const handleShowEditNotebookModal = (notebook) => {
        setEditNotebookId(notebook.id);
        setNotebookToEdit(notebook.name);
        setShowEditNotebookModal(true);
    };

    const handleCloseEditNotebookModal = () => {
        setShowEditNotebookModal(false);
        setEditNotebookId(null);
        setNotebookToEdit('');
    };

    const handleShowNotebookHistory = async () => {
        if (selectedNotebook) {
            const notebookDoc = doc(db, 'notebooks', selectedNotebook.id);
            const notebookSnapshot = await getDoc(notebookDoc);
            const notebookData = notebookSnapshot.data();
            setNotebookHistory(notebookData?.history || []);
            setShowNotebookHistoryModal(true);
        }
    };

    const handleRevertNotebookVersion = async (version) => {
        if (selectedNotebook) {
            const notebookDoc = doc(db, 'notebooks', selectedNotebook.id);
            await updateDoc(notebookDoc, { name: version.name });
        }
    };

    const handleCloseNotebookHistoryModal = () => {
        setShowNotebookHistoryModal(false);
        setNotebookHistory([]);
    };

    return (
        <Container>
            <h2>Notes</h2>
            <Button variant="primary" onClick={() => setShowNotebookModal(true)}>Add Notebook</Button>

            <Form className="mt-3">
                <Form.Group controlId="formSelectNotebook">
                    <Form.Label>Select Notebook</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedNotebook ? selectedNotebook.id : ''}
                        onChange={(e) => {
                            const notebookId = e.target.value;
                            const notebook = notebooks.find(nb => nb.id === notebookId);
                            setSelectedNotebook(notebook);
                        }}
                    >
                        <option value="">Select a notebook</option>
                        {notebooks.map(notebook => (
                            <option key={notebook.id} value={notebook.id}>
                                {notebook.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {selectedNotebook && (
                    <>
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

                        {/* Buttons for editing, deleting, and viewing history of the selected notebook */}
                        <div className="mt-3">
                            <Button
                                variant="warning"
                                onClick={() => handleShowEditNotebookModal(selectedNotebook)}
                            >
                                Edit Notebook
                            </Button>
                            <Button
                                variant="danger"
                                className="ml-2"
                                onClick={() => handleDeleteNotebook(selectedNotebook.id)}
                            >
                                Delete Notebook
                            </Button>
                            <Button
                                variant="info"
                                className="ml-2"
                                onClick={handleShowNotebookHistory}
                            >
                                View History
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {selectedNotebook && (
                <ListGroup className="mt-3">
                    {notebookNotes.map(note => (
                        <ListGroup.Item key={note.id}>
                            {note.text}
                            <Button
                                variant="link"
                                onClick={() => handleEditNote(note.id, prompt('Edit note:', note.text))}
                            >
                                Edit
                            </Button>
                            <Button variant="link" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                            <Button variant="link" onClick={() => handleShowNoteModal(note)}>View History</Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {selectedNote && (
                <Modal show={showNoteModal} onHide={handleCloseNoteModal}>
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
                        <Button variant="secondary" onClick={handleCloseNoteModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}

            <Modal show={showNotebookModal} onHide={() => setShowNotebookModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Notebook</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formNotebookName">
                        <Form.Label>Notebook Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter notebook name"
                            value={newNotebookName}
                            onChange={(e) => setNewNotebookName(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNotebookModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddNotebook}>Add Notebook</Button>
                </Modal.Footer>
            </Modal>

            {editNotebookId && (
                <Modal show={showEditNotebookModal} onHide={handleCloseEditNotebookModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Notebook</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="formEditNotebookName">
                            <Form.Label>Notebook Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={notebookToEdit}
                                onChange={(e) => setNotebookToEdit(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditNotebookModal}>Close</Button>
                        <Button variant="primary" onClick={handleEditNotebook}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>
            )}

            <Modal show={showNotebookHistoryModal} onHide={handleCloseNotebookHistoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Notebook History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {notebookHistory.map((version, index) => (
                            <ListGroup.Item key={index}>
                                {version.name} - {version.timestamp.toDate().toLocaleString()}
                                <Button
                                    variant="link"
                                    className="ml-2"
                                    onClick={() => handleRevertNotebookVersion(version)}
                                >
                                    Revert
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNotebookHistoryModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Notes;
