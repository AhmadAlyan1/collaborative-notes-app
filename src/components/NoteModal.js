import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const NoteModal = ({ show, onHide, versionHistory, handleRevertVersion }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Note Version History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {versionHistory.map((version, index) => (
                        <ListGroup.Item key={index}>
                            <div>{version.text}</div>
                            <div>{version.timestamp.toDate().toLocaleString()}</div>
                            <div><strong>Edited by:</strong> {version.email}</div> {/* Display the email of the user who edited */}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRevertVersion(version)}
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

export default NoteModal;
