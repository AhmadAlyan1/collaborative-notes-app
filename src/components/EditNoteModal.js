import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditNoteModal = ({ show, onHide, selectedNote, editNoteText, setEditNoteText, handleEditNote }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Note</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Note Text</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => handleEditNote(selectedNote.id, editNoteText)}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditNoteModal;
