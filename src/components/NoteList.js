import React from 'react';
import { ListGroup, Button, Form } from 'react-bootstrap';

const NoteList = ({ notebookNotes, newNote, setNewNote, handleAddNote, handleDeleteNote, handleShowNoteModal, setShowEditNoteModal, setEditNoteText, setSelectedNote }) => {
    return (
        <>
            <Form className="my-3">
                <Form.Group>
                    <Form.Label>New Note</Form.Label>
                    <Form.Control
                        type="text"
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" className="my-3" onClick={handleAddNote}>
                    Add Note
                </Button>
            </Form>
            <ListGroup>
                {notebookNotes.map((note) => (
                    <ListGroup.Item key={note.id}>
                        {note.text}
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            style={{ float: 'right', marginLeft: '5px' }}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setShowEditNoteModal(true);
                                setEditNoteText(note.text);
                                setSelectedNote(note);
                            }}
                            style={{ float: 'right', marginLeft: '5px' }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowNoteModal(note)}
                            style={{ float: 'right' }}
                        >
                            History
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    );
};

export default NoteList;
