import { Button, Heading, Text} from '@chakra-ui/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getAuthToken, decodeToken } from '../utils/helperFunctions';
import { sendIssueReportEmail } from '../utils/sendEmails';

const ReportIssueForm = () => {
    const year = new Date().getFullYear();
    const name = decodeToken(getAuthToken()).name;
    const email = decodeToken(getAuthToken()).email;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    
    const submitReview = (e) => {
        e.preventDefault();
        if(!e.target.form.reportValidity() || !title?.length || !description?.length){
            toast.error('please provide valid details');
            return;
        }

        const toastId = toast.loading("reporting issue...");
        setIsLoading(true);

        sendIssueReportEmail(email, name, title, description)
        .then(() =>{
            toast.success('issue report sent successfully', {id : toastId});
            setTitle('');
            setDescription('');
            setIsLoading(false);
        })
        .catch(err =>{
            toast.error(err.message || "an error occurred", {id : toastId});
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
            <Text mt={5} color='gray.300'>You will receive the response for this issue on your registered email id within 3 days.</Text>

            <footer style={{ fontSize: "14px", textAlign: "center", color: "#666", marginTop: '20px' }}>
                ©{year} DataVault.
            </footer>
        </div>
    );
};

export default ReportIssueForm;
