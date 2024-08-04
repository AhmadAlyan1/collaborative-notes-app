import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const NotebookList = ({ notebooks, selectedNotebook, setSelectedNotebook, handleShowEditNotebookModal, handleDeleteNotebook, handleShowNotebookHistory }) => {
    return (
        <ListGroup>
            {notebooks.map((notebook) => (
                <ListGroup.Item
                    key={notebook.id}
                    active={selectedNotebook && selectedNotebook.id === notebook.id}
                    onClick={() => setSelectedNotebook(notebook)}
                >
                    {notebook.name}
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(notebook.id); }}
                        style={{ float: 'right', marginLeft: '5px' }}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleShowEditNotebookModal(notebook); }}
                        style={{ float: 'right', marginLeft: '5px' }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="info"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleShowNotebookHistory(); }}
                        style={{ float: 'right' }}
                    >
                        History
                    </Button>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default NotebookList;
