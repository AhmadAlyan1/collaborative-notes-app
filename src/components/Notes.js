import React, { useState, useEffect } from 'react';
import { Container, Button} from 'react-bootstrap';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AddNotebookModal from './AddNotebookModal';
import EditNotebookModal from './EditNotebookModal';
import NotebookHistoryModal from './NotebookHistoryModal';
import NoteModal from './NoteModal';
import EditNoteModal from './EditNoteModal';
import NotebookList from './NotebookList';
import NoteList from './NoteList';

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
                // Update the selected notebook's name after reverting
                setSelectedNotebook({ ...selectedNotebook, name: version.name });
            }
        }
    };

    return (
        <Container>
            <Button className="my-3" onClick={() => setShowNotebookModal(true)}>Add Notebook</Button>
            <NotebookList
                className="my-3"
                notebooks={notebooks}
                selectedNotebook={selectedNotebook}
                setSelectedNotebook={setSelectedNotebook}
                handleShowEditNotebookModal={handleShowEditNotebookModal}
                handleDeleteNotebook={handleDeleteNotebook}
                handleShowNotebookHistory={handleShowNotebookHistory}
            />
            <NoteList
                notebookNotes={notebookNotes}
                newNote={newNote}
                setNewNote={setNewNote}
                handleAddNote={handleAddNote}
                handleDeleteNote={handleDeleteNote}
                handleShowNoteModal={handleShowNoteModal}
                setShowEditNoteModal={setShowEditNoteModal}
                setEditNoteText={setEditNoteText}
                setSelectedNote={setSelectedNote}
            />
            <AddNotebookModal
                show={showNotebookModal}
                onHide={() => setShowNotebookModal(false)}
                newNotebookName={newNotebookName}
                setNewNotebookName={setNewNotebookName}
                handleAddNotebook={handleAddNotebook}
            />
            <EditNotebookModal
                show={showEditNotebookModal}
                onHide={handleCloseEditNotebookModal}
                notebookToEdit={notebookToEdit}
                setNotebookToEdit={setNotebookToEdit}
                handleEditNotebook={handleEditNotebook}
            />
            <NotebookHistoryModal
                show={showNotebookHistoryModal}
                onHide={handleCloseNotebookHistoryModal}
                notebookHistory={notebookHistory}
                handleRevertNotebookVersion={handleRevertNotebookVersion}
            />
            <NoteModal
                show={showNoteModal}
                onHide={handleCloseNoteModal}
                versionHistory={versionHistory}
                handleRevertVersion={handleRevertVersion}
            />
            <EditNoteModal
                show={showEditNoteModal}
                onHide={() => setShowEditNoteModal(false)}
                selectedNote={selectedNote}
                editNoteText={editNoteText}
                setEditNoteText={setEditNoteText}
                handleEditNote={handleEditNote}
            />
        </Container>
    );
};

export default Notes;
