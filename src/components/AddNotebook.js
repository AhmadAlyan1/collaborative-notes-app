import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const AddNotebook = () => {
    const [notebookName, setNotebookName] = useState('');

    const handleAddNotebook = async () => {
        try {
            await addDoc(collection(db, 'notebooks'), {
                name: notebookName,
                createdAt: new Date(),
            });
            alert('Notebook created successfully!');
            setNotebookName('');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>Create Notebook</h2>
            <input
                type="text"
                value={notebookName}
                onChange={(e) => setNotebookName(e.target.value)}
                placeholder="Notebook Name"
            />
            <button onClick={handleAddNotebook}>Add Notebook</button>
        </div>
    );
};

export default AddNotebook;
