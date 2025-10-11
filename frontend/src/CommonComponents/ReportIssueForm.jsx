import { Button, Heading, Text} from '@chakra-ui/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';

const ReportIssueForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    
    const submitReview = (e) => {
        e.preventDefault();
        if(!e.target.form.reportValidity() || !title?.length || !description?.length){
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading("reporting issue...");
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/issue`, {title, description}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setTitle('');
                setDescription('');
            }
            setIsLoading(false);
        })
        .catch(err =>{
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            console.log(err);
            setIsLoading(false);
        });
    };
    
    return (
        <div>
            <Heading as="h3" size="md" mb={4} textAlign="center">
                Report an Issue
            </Heading>
            <form className="login-form">
                <label className="login-label">Issue Title</label>
                <input placeholder="Enter a short title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="login-input"/>

                <label className="login-label">Description</label>
                <textarea placeholder="Describe the issue in detail" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required className="login-input"/>

                <Button disabled={isLoading} type='submit' colorScheme='blue' width="full" onClick={submitReview}>Send Report</Button>
            </form>
            <Text mt={5} color='gray.300'>You will receive the response for this issue on your registered email id within 5 days.</Text>
        </div>
    );
};

export default ReportIssueForm;
  