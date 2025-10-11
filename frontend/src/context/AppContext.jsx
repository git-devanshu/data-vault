import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    // vault related context
    const [masterKey, setMasterKey] = useState(null);
    const [labels, setLabels] = useState();
    const [trackers, setTrackers] = useState();
    const [notes, setNotes] = useState();

    // user settings context (not to be cleared once loaded)
    const [hideRemovedLabels, setHideRemovedLabels] = useState(false);
    const [hideRemovedTrackers, setHideRemovedTrackers] = useState(false);
    const [hideHighPriorityNotes, setHideHighPriorityNotes] = useState(false);
    const [hideNoteEditButton, setHideNoteEditButton] = useState(false);
    const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
    const [hideExpenseDeleteButton, setHideExpenseDeleteButton] = useState(false);
    
    const clearMasterKey = useCallback(() => {
        setMasterKey(null);
    }, []);

    const value = {
        masterKey,
        setMasterKey,
        clearMasterKey,
        hasKey: !!masterKey,
        labels,
        setLabels,
        hideRemovedLabels,
        setHideRemovedLabels,
        trackers,
        setTrackers,
        hideRemovedTrackers,
        setHideRemovedTrackers,
        hideExpenseDeleteButton,
        setHideExpenseDeleteButton,
        notes,
        setNotes,
        hideHighPriorityNotes,
        setHideHighPriorityNotes,
        hideNoteEditButton,
        setHideNoteEditButton,
        hideCompletedTasks,
        setHideCompletedTasks
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('an error occurred!');
    }
    return context;
};
