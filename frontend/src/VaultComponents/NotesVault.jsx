import React, { useState, useMemo } from 'react'
import './vaultStyle.css';
import { useAppContext } from '../context/AppContext';
import useClearOnUnmount from '../hooks/useClearOnUnmount';
import PinModal from '../CommonComponents/PinModal';
import Loading from '../CommonComponents/Loading';
import { notesVaultHelpText } from '../utils/helpTextForModules';
import { Badge, Button, ButtonGroup, Heading, IconButton, Text, Spacer, Wrap, WrapItem, Stack } from '@chakra-ui/react';
import { PlusSquareIcon, EditIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import HelpPopup from '../CommonComponents/HelpPopup';
import ViewNotePopup from '../VaultPopupComponents/ViewNotePopup';
import PriorityIcon from '../VaultPopupComponents/PriorityIcon';
import AddNotePopup from '../VaultPopupComponents/AddNotePopup';
import UpdateNotePopup from '../VaultPopupComponents/UpdateNotePopup';

export default function NotesVault() {
    const { masterKey, clearMasterKey, notes, hideHighPriorityNotes, hideNoteEditButton } = useAppContext();

    const [error, setError] = useState();

    const [query, setQuery] = useState('');

    const [noteToUse, setNoteToUse] = useState(null); // for editing and viewing

    const [showAddNotesPopup, setShowAddNotesPopup] = useState(false);
    const [showUpdateNotesPopup, setShowUpdateNotesPopup] = useState(false);
    const [showViewNotesPopup, setShowViewNotesPopup] = useState(false);

    const [showHelp, setShowHelp] = useState(false);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filtered = useMemo(() => {
        if(!query.trim()) return notes;
        const q = query.toLowerCase();
        return notes.filter(item =>
            item.title.toLowerCase().includes(q)
        );
    }, [notes, query]);

    if(!masterKey){
        return <PinModal/>
    }

    if(!notes){
        return <Loading data='Notes List' error={error}/>
    }

    return (
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Notes Vault</Heading>
            <ButtonGroup mt={6} alignItems='center'>
                <Button title='add note' onClick={()=> setShowAddNotesPopup(true)} leftIcon={<PlusSquareIcon />}>Note</Button>
                <input className="login-input" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Search Title' style={{marginBottom: 0}}/>
                <IconButton title='vault guide' onClick={()=> setShowHelp(true)} icon={<InfoOutlineIcon w={5} h={5} color='white'/>} border='none' background='transparent' _hover={{bgColor: 'transparent'}}/>
            </ButtonGroup>

            {/* Display the notes */}
            {filtered.length === 0 && <Text color='#aaa' mt={8} textAlign='center'>You haven't added any notes yet.</Text>}
            {filtered.length !== 0 && 
                <Wrap spacing='15px' mt={5}>
                    {filtered.map((note, index) => {
                        if(hideHighPriorityNotes && parseInt(note.priority) === 3) return null;
                        return(
                            <WrapItem key={index}>
                                <Stack className='password-card' style={{width: '160px', minWidth: '160px', borderLeft: `5px solid ${note.categoryColor}`, height: '200px', cursor: 'pointer', zIndex: 1, borderRadius: '10px', padding: '10px'}} onClick={()=> { setNoteToUse(filtered[index]); setShowViewNotesPopup(true); }} _hover={{backgroundColor: '#222b3e'}}>
                                    <Text fontSize='16px'>{note.title.slice(0, 50)}...</Text>
                                    {note.tag && <Badge colorScheme='gray' width='fit-content'>{note.tag}</Badge>}
                                    <Spacer/>
                                    <Stack align='center' direction='row'>
                                        {!hideNoteEditButton && <IconButton title='edit' onClick={(e)=> {e.stopPropagation(); setNoteToUse(filtered[index]); setShowUpdateNotesPopup(true)}} icon={<EditIcon h={6} w={6}/>} backgroundColor='transparent' color='gray' zIndex={3} _hover={{backgroundColor: 'transparent', color: 'white'}}/>}
                                        <PriorityIcon priority={parseInt(note.priority)}/>
                                    </Stack>
                                </Stack>
                            </WrapItem>
                        );
                    })}
                </Wrap>
            }

            {/* Notes Popups */}
            {showViewNotesPopup && <ViewNotePopup data={noteToUse} setShowPopup={setShowViewNotesPopup}/>}
            {showAddNotesPopup && <AddNotePopup setShowPopup={setShowAddNotesPopup}/>}
            {showUpdateNotesPopup && <UpdateNotePopup data={noteToUse} setShowPopup={setShowUpdateNotesPopup}/>}

            {/* Help Popup */}
            {showHelp && <HelpPopup title="Notes Vault Guide" helpText={notesVaultHelpText} setShowPopup={setShowHelp}/>}
        </div>
    );
}
