import React, {useState} from 'react'
import '../CommonComponents/commonStyle.css';
import '../AuthComponents/authStyle.css';
import { CloseButton, Spacer, Stack, Text, Button } from '@chakra-ui/react';
import { PlusSquareIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { generateNoteId, getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import { TwitterPicker } from 'react-color';

export default function AddNotePopup({setShowPopup}) {
    const { masterKey, notes, setNotes } = useAppContext();

    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [priority, setPriority] = useState('');
    const [categoryColor, setCategoryColor] = useState('');
    const [tag, setTag] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const addNote = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || title.length === 0 || note.length === 0 || categoryColor.length === 0) {
            toast.error('please provide valid details');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('adding a note...');

        try{
            const token = getAuthToken();
            const noteId = generateNoteId();
            const {encryptedData: encryptedNote, nonce} = await encryptData(note, masterKey);

            const newNote = {
                title, priority, categoryColor, tag, noteId
            }
            const updatedNotesList = [...notes, newNote];
            const {encryptedData: notesList, nonce: notesNonce} = await encryptData(JSON.stringify(updatedNotesList), masterKey);

            const response = await axios.post(getBaseURL() + `/api/notes/${primaryAPIVersion()}`, {noteId, note: encryptedNote, nonce, notesList, notesNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(response.status === 200){
                toast.success(response.data?.message, {id: toastId});
                setNotes(updatedNotesList);
                setShowPopup(false);
                setTitle('');
                setNote('');
                setPriority('');
                setTag(null);
                setCategoryColor('');
            }
            setIsLoading(false);
        }
        catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || "an error occurred!", {id: toastId});
            setIsLoading(false);
        }
    }

    const basicColors = [
        '#ff0000', // red
        '#ffff00', // yellow
        '#ffa500', // orange
        '#0000ff', // blue
        '#00ffff', // cyan
        '#008000', // green
        '#00ff00', // lime
        '#808080', // gray
        '#a52a2a', // brown
        '#000000', // black
        '#ffffff', // white
    ];
    
    const customStyles = {
        default: {
            card: {
                background: '#121826',
                borderRadius: '10px',
                marginBottom: '15px'
            },
            body: { padding: '8px' },
            hash: { display: 'none' },
            input: { height: '30px', width: '93px', borderRadius: '10px' }
        }
    };

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{height: '100vh', width: '100%', top: '0', left: '0', overflowY: 'scroll', scrollbarWidth: "none", borderRadius: '0', maxHeight: '100vh'}}>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Add Note</Text>
                <Spacer/>
                <CloseButton title='close' color='white' onClick={()=> setShowPopup(false)}/>
            </Stack>

            <form className='login-form'>
                <label className="login-label">Title</label>
                <input type="text" name='title' value={title} onChange={(e)=> setTitle(e.target.value)} maxLength={100} required className="login-input" />

                <label className="login-label">Category Color</label>
                <TwitterPicker triangle="hide" colors={basicColors} color={categoryColor} onChangeComplete={(c)=> setCategoryColor(c.hex)} styles={customStyles}/>

                <label className="login-label">Priority</label>
                <select className="login-input" name='priority' value={priority} onChange={(e)=> setPriority(e.target.value)} required>
                    <option value="">-- Select Priority --</option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>
                
                <label className="login-label">Tag</label>
                <input type="text" name='tag' value={tag} onChange={(e)=> setTag(e.target.value)} minLength={3} maxLength={15} className="login-input" />

                <label className="login-label">Note</label>
                <textarea type="text" name='note' value={note} onChange={(e)=> setNote(e.target.value)} maxLength={2000} required className="login-input" style={{height: '200px'}} />

                <Button disabled={isLoading} type="submit" onClick={addNote} leftIcon={<PlusSquareIcon />} width='fit-content'>Add</Button>
            </form>
        </div>
        </>
    );
}
