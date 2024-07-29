import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const AddNote = () => {
    const [note, setNote] = useState('');

    const handleAddNote = async () => {
        try {
            await addDoc(collection(db, 'notes'), {
                content: note,
                timestamp: new Date(),
            });
            alert('Note added successfully!');
            setNote('');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>Add Note</h2>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={handleAddNote}>Add Note</button>
        </div>
    );
};

export default AddNote;

//AA