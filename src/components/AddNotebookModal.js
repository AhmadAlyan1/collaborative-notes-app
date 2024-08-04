import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddNotebookModal = ({ show, onHide, newNotebookName, setNewNotebookName, handleAddNotebook }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Notebook</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Notebook Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newNotebookName}
                            onChange={(e) => setNewNotebookName(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddNotebook}>
                    Add Notebook
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddNotebookModal;
