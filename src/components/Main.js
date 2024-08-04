import React, { useState } from 'react';
import Notebooks from './Notebooks';
import NotesList from './NotesList';

const Main = () => {
    const [selectedNotebook, setSelectedNotebook] = useState(null);

    return (
        <div className="container">
            <h1>Collaborative Note-Taking App</h1>
            <div className="row">
                <div className="col-md-4">
                    <Notebooks
                        selectedNotebook={selectedNotebook}
                        setSelectedNotebook={setSelectedNotebook}
                    />
                </div>
                <div className="col-md-8">
                    <NotesList selectedNotebook={selectedNotebook} />
                </div>
            </div>
        </div>
    );
};

export default Main;
