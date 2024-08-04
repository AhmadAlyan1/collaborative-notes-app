import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditNotebookModal = ({ show, onHide, notebookToEdit, setNotebookToEdit, handleEditNotebook }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Notebook</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Notebook Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={notebookToEdit}
                            onChange={(e) => setNotebookToEdit(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleEditNotebook}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditNotebookModal;
