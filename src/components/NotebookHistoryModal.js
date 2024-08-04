import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const NotebookHistoryModal = ({ show, onHide, notebookHistory, handleRevertNotebookVersion }) => {
    console.log('handleRevertNotebookVersion:', handleRevertNotebookVersion);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Notebook History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {notebookHistory.map((version, index) => (
                        <ListGroup.Item key={index}>
                            <div>{version.name}</div>
                            <div>{version.timestamp.toDate().toLocaleString()}</div>
                            <div><strong>Edited by:</strong> {version.email}</div> {/* Display the email of the user who edited */}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRevertNotebookVersion(version)}
                                style={{ float: 'right' }}
                            >
                                Revert
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NotebookHistoryModal;
