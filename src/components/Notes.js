import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Modal } from 'react-bootstrap';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
    const [showEditNoteModal, setShowEditNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [newNotebookName, setNewNotebookName] = useState('');
    const [editNotebookId, setEditNotebookId] = useState(null);
    const [notebookToEdit, setNotebookToEdit] = useState('');
    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const notebooksCollection = collection(db, 'notebooks');
        const unsubscribe = onSnapshot(notebooksCollection, (snapshot) => {
            const notebooksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotebooks(notebooksData);

            // Check if the selected notebook still exists
            if (selectedNotebook && !snapshot.docs.find(doc => doc.id === selectedNotebook.id)) {
                setSelectedNotebook(null);  // Set to null if the notebook is deleted
            }
        });
        return () => unsubscribe();
    }, [selectedNotebook, db]);

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
        } else {
            setNotebookNotes([]);
        }
    }, [selectedNotebook, db]);

    const handleAddNote = async () => {
        if (newNote.trim() && selectedNotebook) {
            const user = auth.currentUser;
            if (user) {
                await addDoc(collection(db, 'notebooks', selectedNotebook.id, 'notes'), {
                    text: newNote,
                    createdAt: Timestamp.now(),
                    email: user.email
                });
                setNewNote('');
            }
        }
    };

    const handleEditNote = async (id, newText) => {
        if (selectedNotebook) {
            const noteDoc = doc(db, 'notebooks', selectedNotebook.id, 'notes', id);
            const noteSnapshot = await getDoc(noteDoc);
            const noteData = noteSnapshot.data();
            const user = auth.currentUser;

            if (noteData && user) {
                const updatedHistory = [
                    ...(noteData.history || []),
                    { text: noteData.text, timestamp: Timestamp.now(), email: noteData.email }
                ];

                const deduplicatedHistory = updatedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => (
                        t.text === item.text && t.timestamp.toMillis() === item.timestamp.toMillis()
                    ))
                );

                await updateDoc(noteDoc, { text: newText, history: deduplicatedHistory, email: user.email });
                setShowEditNoteModal(false); // Close the modal after editing
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
            const noteSnapshot = await getDoc(noteDoc);
            const noteData = noteSnapshot.data();
            const user = auth.currentUser;

            if (noteData && user) {
                const updatedHistory = [
                    ...(noteData.history || []),
                    { text: noteData.text, timestamp: Timestamp.now(), email: noteData.email }
                ];

                const deduplicatedHistory = updatedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => (
                        t.text === item.text && t.timestamp.toMillis() === item.timestamp.toMillis()
                    ))
                );

                await updateDoc(noteDoc, { text: version.text, history: deduplicatedHistory, email: user.email });
            }
        }
    };

    const handleAddNotebook = async () => {
        if (newNotebookName.trim()) {
            const user = auth.currentUser;
            if (user) {
                await addDoc(collection(db, 'notebooks'), {
                    name: newNotebookName,
                    history: [],
                    email: user.email
                });
                setNewNotebookName('');
                setShowNotebookModal(false);
            }
        }
    };

    const handleEditNotebook = async () => {
        if (editNotebookId && notebookToEdit.trim()) {
            const notebookDoc = doc(db, 'notebooks', editNotebookId);
            const notebookSnapshot = await getDoc(notebookDoc);
            const notebookData = notebookSnapshot.data();
            const user = auth.currentUser;

            if (notebookData && user) {
                const updatedHistory = [
                    ...(notebookData.history || []),
                    { name: notebookData.name, timestamp: Timestamp.now(), email: notebookData.email }
                ];

                const deduplicatedHistory = updatedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === item.name && t.timestamp.toMillis() === item.timestamp.toMillis()
                    ))
                );

                await updateDoc(notebookDoc, { name: notebookToEdit, history: deduplicatedHistory, email: user.email });
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
    };

    const handleShowNotebookHistory = async () => {
        if (selectedNotebook) {
            const notebookDoc = doc(db, 'notebooks', selectedNotebook.id);
            const notebookSnapshot = await getDoc(notebookDoc);
            const notebookData = notebookSnapshot.data();
            setNotebookHistory(notebookData.history || []);
            setShowNotebookHistoryModal(true);
        }
    };

    const handleCloseNotebookHistoryModal = () => {
        setShowNotebookHistoryModal(false);
        setNotebookHistory([]);
    };

    const handleRevertNotebookVersion = async (version) => {
        if (selectedNotebook) {
            const notebookDoc = doc(db, 'notebooks', selectedNotebook.id);
            const notebookSnapshot = await getDoc(notebookDoc);
            const notebookData = notebookSnapshot.data();
            const user = auth.currentUser;

            if (notebookData && user) {
                const updatedHistory = [
                    ...(notebookData.history || []),
                    { name: notebookData.name, timestamp: Timestamp.now(), email: notebookData.email }
                ];

                const deduplicatedHistory = updatedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === item.name && t.timestamp.toMillis() === item.timestamp.toMillis()
                    ))
                );

                await updateDoc(notebookDoc, { name: version.name, history: deduplicatedHistory, email: user.email });
            }
        }
    };

    const handleShowEditNoteModal = (note) => {
        setSelectedNote(note);
        setEditNoteText(note.text);
        setShowEditNoteModal(true);
    };

    const handleCloseEditNoteModal = () => {
        setShowEditNoteModal(false);
        setSelectedNote(null);
    };

    const handleNotebookSelect = (e) => {
        const notebookId = e.target.value;
        const selected = notebooks.find(notebook => notebook.id === notebookId);
        setSelectedNotebook(selected);
    };

    return (
        <Container>
            <Form.Group controlId="notebookSelect">
                <Form.Label>Select Notebook</Form.Label>
                <Form.Control as="select" onChange={handleNotebookSelect}>
                    <option value="">Select...</option>
                    {notebooks.map(notebook => (
                        <option key={notebook.id} value={notebook.id}>{notebook.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Button variant="primary" onClick={() => setShowNotebookModal(true)}>Add Notebook</Button>
            <Button variant="secondary" onClick={handleShowNotebookHistory} disabled={!selectedNotebook}>Show Notebook History</Button>
            {selectedNotebook && (
                <>
                    <Button variant="warning" onClick={() => handleShowEditNotebookModal(selectedNotebook)}>Edit Notebook</Button>
                    <Button variant="danger" onClick={() => handleDeleteNotebook(selectedNotebook.id)}>Delete Notebook</Button>
                    <Form.Group controlId="newNote">
                        <Form.Label>Add a Note</Form.Label>
                        <Form.Control type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddNote}>Add Note</Button>
                    <ListGroup>
                        {notebookNotes.map(note => (
                            <ListGroup.Item key={note.id}>
                                <div>{note.text}</div>
                                <div>{note.email} - {note.createdAt.toDate().toLocaleString()}</div>
                                <Button variant="secondary" onClick={() => handleShowNoteModal(note)}>Show Version History</Button>
                                <Button variant="warning" onClick={() => handleShowEditNoteModal(note)}>Edit</Button>
                                <Button variant="danger" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            )}

            {/* Add Notebook Modal */}
            <Modal show={showNotebookModal} onHide={() => setShowNotebookModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Notebook</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="newNotebookName">
                        <Form.Label>Notebook Name</Form.Label>
                        <Form.Control type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNotebookModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddNotebook}>Add Notebook</Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Notebook Modal */}
            <Modal show={showEditNotebookModal} onHide={handleCloseEditNotebookModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Notebook</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="notebookToEdit">
                        <Form.Label>New Notebook Name</Form.Label>
                        <Form.Control type="text" value={notebookToEdit} onChange={(e) => setNotebookToEdit(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditNotebookModal}>Close</Button>
                    <Button variant="primary" onClick={handleEditNotebook}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            {/* Note History Modal */}
            <Modal show={showNoteModal} onHide={handleCloseNoteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Note Version History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {versionHistory.map((version, index) => (
                            <ListGroup.Item key={index}>
                                <div>{version.text}</div>
                                <div>{version.email} - {version.timestamp.toDate().toLocaleString()}</div>
                                <Button variant="secondary" onClick={() => handleRevertVersion(version)}>Revert</Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNoteModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Notebook History Modal */}
            <Modal show={showNotebookHistoryModal} onHide={handleCloseNotebookHistoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Notebook Version History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {notebookHistory.map((version, index) => (
                            <ListGroup.Item key={index}>
                                <div>{version.name}</div>
                                <div>{version.email} - {version.timestamp.toDate().toLocaleString()}</div>
                                <Button variant="secondary" onClick={() => handleRevertNotebookVersion(version)}>Revert</Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNotebookHistoryModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Note Modal */}
            <Modal show={showEditNoteModal} onHide={handleCloseEditNoteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="editNoteText">
                        <Form.Label>Note Text</Form.Label>
                        <Form.Control type="text" value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditNoteModal}>Close</Button>
                    <Button variant="primary" onClick={() => handleEditNote(selectedNote.id, editNoteText)}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Notes;
