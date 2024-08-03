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
                const notebookRef = await addDoc(collection(db, 'notebooks'), {
                    name: newNotebookName,
                    history: [],
                    email: user.email
                });
                setNewNotebookName('');
                setShowNotebookModal(false);
                // Select the newly added notebook
                setSelectedNotebook({ id: notebookRef.id, name: newNotebookName, email: user.email });
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

    return (
        <Container>
            <h1>NoteBooks</h1>
            <div className="d-flex mb-3">
                <Button variant="primary" onClick={() => setShowNotebookModal(true)}>
                    Add Notebook
                </Button>
                {selectedNotebook && (
                    <>
                        <Button variant="secondary" onClick={handleShowNotebookHistory}>
                            View Notebook History
                        </Button>
                        <Button variant="warning" onClick={() => handleShowEditNotebookModal(selectedNotebook)}>
                            Edit Notebook
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteNotebook(selectedNotebook.id)}>
                            Delete Notebook
                        </Button>
                    </>
                )}
            </div>
            <ListGroup>
                {notebooks.map(notebook => (
                    <ListGroup.Item
                        key={notebook.id}
                        active={selectedNotebook && notebook.id === selectedNotebook.id}
                        onClick={() => setSelectedNotebook(notebook)}
                    >
                        {notebook.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {selectedNotebook && (
                <>
                    <h2 className="mt-4">Notes</h2>
                    <Form.Control
                        type="text"
                        rows={3}
                        placeholder="New note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button variant="primary" onClick={handleAddNote}>
                        Add Note
                    </Button>
                    <ListGroup className="mt-3">
                        {notebookNotes.map(note => (
                            <ListGroup.Item key={note.id}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>{note.text}</div>
                                    <div>
                                        <Button variant="info" size="sm" onClick={() => handleShowNoteModal(note)}>
                                            View Versions
                                        </Button>
                                        <Button variant="warning" size="sm" onClick={() => {
                                            setSelectedNote(note);
                                            setEditNoteText(note.text);
                                            setShowEditNoteModal(true);
                                        }}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteNote(note.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            )}

            <Modal show={showNoteModal} onHide={handleCloseNoteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Note Versions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {versionHistory.length > 0 ? (
                        <ListGroup>
                            {versionHistory.map((version, index) => (
                                <ListGroup.Item key={index}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p>{version.text}</p>
                                            <small>{new Date(version.timestamp.toMillis()).toLocaleString()}</small>
                                            <small> - {version.email}</small>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleRevertVersion(version)}
                                        >
                                            Revert
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p>No versions available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNoteModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showNotebookModal} onHide={() => setShowNotebookModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Notebook</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        placeholder="Notebook name"
                        value={newNotebookName}
                        onChange={(e) => setNewNotebookName(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNotebookModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddNotebook}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditNotebookModal} onHide={handleCloseEditNotebookModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Notebook</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        placeholder="Notebook name"
                        value={notebookToEdit}
                        onChange={(e) => setNotebookToEdit(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditNotebookModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleEditNotebook}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditNoteModal} onHide={() => setShowEditNoteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        rows={3}
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditNoteModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleEditNote(selectedNote.id, editNoteText)}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showNotebookHistoryModal} onHide={handleCloseNotebookHistoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Notebook Versions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {notebookHistory.length > 0 ? (
                        <ListGroup>
                            {notebookHistory.map((version, index) => (
                                <ListGroup.Item key={index}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p>{version.name}</p>
                                            <small>{new Date(version.timestamp.toMillis()).toLocaleString()}</small>
                                            <small> - {version.email}</small>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleRevertNotebookVersion(version)}
                                        >
                                            Revert
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p>No versions available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNotebookHistoryModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Notes;
