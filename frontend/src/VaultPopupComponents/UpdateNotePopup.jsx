import React, {useState, useEffect} from 'react'
import '../CommonComponents/commonStyle.css';
import '../AuthComponents/authStyle.css';
import { CloseButton, Spacer, Stack, Text, Button, ButtonGroup } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData, decryptData } from '../utils/cipherFunctions';
import { TwitterPicker } from 'react-color';
import Loading from '../CommonComponents/Loading';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';

export default function UpdateNotePopup({data, setShowPopup}) {
    const { masterKey, notes, setNotes } = useAppContext();

    const [title, setTitle] = useState(data.title);
    const [priority, setPriority] = useState(data.priority);
    const [categoryColor, setCategoryColor] = useState(data.categoryColor);
    const [tag, setTag] = useState(data.tag || '');

    const [note, setNote] = useState();
    const [error, setError] = useState();

    const [isLoading, setIsLoading] = useState(false);
    const [changed, setChanged] = useState(false);

    const [showDeleteNotePopup, setShowDeleteNotePopup] = useState(false);

    useEffect(()=>{
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/notes/${primaryAPIVersion()}/${data.noteId}`, {headers : {
            Authorization: `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const decryptedNote = await decryptData(res.data?.note, res.data?.nonce, masterKey);
                setNote(decryptedNote);
            }
        })
        .catch(err =>{
            console.log(err);
            setError(err.response?.data?.message || "failed to load the note");
        });
    }, [data]);

    const updateNote = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || title.length === 0 || note.length === 0 || categoryColor.length === 0) {
            toast.error('please provide valid details');
            return;
        }
        if(!changed){
            toast.error('no changed are made!');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('updating the note...');

        try{
            const token = getAuthToken();
            const {encryptedData: encryptedNote, nonce} = await encryptData(note, masterKey);

            const editedNote = {
                title, priority, categoryColor, tag, noteId: data.noteId
            }
            const updatedNotesList = notes.map(note => note.noteId === data.noteId ? editedNote : note);
            const {encryptedData: notesList, nonce: notesNonce} = await encryptData(JSON.stringify(updatedNotesList), masterKey);

            const response = await axios.put(getBaseURL() + `/api/notes/${primaryAPIVersion()}`, {noteId: data.noteId, note: encryptedNote, nonce, notesList, notesNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(response.status === 200){
                toast.success(response.data?.message, {id: toastId});
                setNotes(updatedNotesList);
                setShowPopup(false);
            }
            setIsLoading(false);
        }
        catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || "an error occurred!", {id: toastId});
            setIsLoading(false);
        }
    }

    const deleteNote = async(noteId) =>{
        setIsLoading(true);
        const toastId = toast.loading('deleting the note...');

        try{
            const token = getAuthToken();
            const updatedNotesList = notes.filter(note => note.noteId !== noteId);
            const {encryptedData: notesList, nonce: notesNonce} = await encryptData(JSON.stringify(updatedNotesList), masterKey);

            const response = await axios.put(getBaseURL() + `/api/notes/${primaryAPIVersion()}/remove`, {noteId, notesList, notesNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(response.status === 200){
                toast.success(response.data?.message, {id: toastId});
                setNotes(updatedNotesList);
                setShowPopup(false);
                setShowDeleteNotePopup(false);
            }
            setIsLoading(false);
        }
        catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || "an error occurred!", {id: toastId});
            setIsLoading(false);
            setShowDeleteNotePopup(false);
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

    if(!note){
        return(
            <div className='popup-container' style={{maxHeight: '98%', height: '98%', width: '98%', top: '1%', left: '1%', overflowY: 'scroll', scrollbarWidth: 'none', padding: 0}}>
                <Loading data='Note' error={error}/>
                <Button colorScheme='red' mt={3} onClick={()=> setShowPopup(false)}>Back</Button>
            </div>
        );
    }

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{ height: '100%', width: '100%', top: '0', left: '0', overflowY: 'scroll', scrollbarWidth: "none"}}>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Update Note</Text>
                <Spacer/>
                <CloseButton title='close' color='white' onClick={()=> setShowPopup(false)}/>
            </Stack>

            <form className='login-form'>
                <label className="login-label">Title</label>
                <input type="text" name='title' value={title} onChange={(e)=> {setTitle(e.target.value); setChanged(true)}} maxLength={100} required className="login-input" />

                <label className="login-label">Category Color</label>
                <TwitterPicker triangle="hide" colors={basicColors} color={categoryColor} onChangeComplete={(c)=> {setCategoryColor(c.hex); setChanged(true)}} styles={customStyles}/>

                <label className="login-label">Priority</label>
                <select className="login-input" name='priority' value={priority} onChange={(e)=> {setPriority(e.target.value); setChanged(true)}} required>
                    <option value="">-- Select Priority --</option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>
                
                <label className="login-label">Tag</label>
                <input type="text" name='tag' value={tag} onChange={(e)=> {setTag(e.target.value); setChanged(true)}} minLength={3} maxLength={15} className="login-input" />

                <label className="login-label">Note</label>
                <textarea type="text" name='note' value={note} onChange={(e)=> {setNote(e.target.value); setChanged(true)}} required maxLength={2000} className="login-input" style={{height: '200px'}} />

                <ButtonGroup>
                    <Button disabled={isLoading} colorScheme='red' onClick={()=> setShowDeleteNotePopup(true)} leftIcon={<DeleteIcon />}>Delete</Button>
                    <Button disabled={!changed || isLoading} type="submit" onClick={updateNote} leftIcon={<EditIcon />}>Update</Button>
                </ButtonGroup>
            </form>

            {/* Delete Note Popup */}
            {showDeleteNotePopup && <ConfirmationPopup title='Delete Note' confirmButtonName='Delete' confirmMsg="This action cannot be undone, do you want to delete this note?" setShowPopup={setShowDeleteNotePopup} confirmAction={deleteNote} actionParams1={data.noteId} isLoading={isLoading}/>}
        </div>
        </>
    );
}
