import React, {useState} from 'react'
import '../CommonComponents/commonStyle.css';
import { CloseButton, Spacer, Stack, Text, Button } from '@chakra-ui/react';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import toast from 'react-hot-toast';

export default function AddExpensePopup({setShowPopup, setRefresh, refresh, trackerIndex}) {
    const { trackers, masterKey } = useAppContext();

    const [data, setData] = useState({
        amount: '',
        spentAt: '',
        spentDate: '',
        category: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setData({
            ...data,
            [name] : value
        });
    }

    const createExpense = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || !data.spentAt?.length || !data.spentDate?.length || data.amount <= 0 || data.category === ""){
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('adding Expense...');
        setIsLoading(true);

        const {encryptedData: expenseData, nonce} = await encryptData(JSON.stringify(data), masterKey);

        try{
            const res = await axios.post(getBaseURL() + `/api/expense/${primaryAPIVersion()}`, {expenseData, nonce, trackerIndex}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setShowPopup(false);
                setRefresh(!refresh);
                setData({
                    amount: '',
                    spentAt: '',
                    spentDate: ''
                });
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container'>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Add Expense to <span style={{color: 'orange'}}>{trackers[trackerIndex].trackerName}</span></Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>

            <form className='login-form'>
                <label className="login-label">Spent At</label>
                <input type="text" name='spentAt' value={data.spentAt} onChange={handleChange} required maxLength={100} className="login-input" />

                <label className="login-label">Amount</label>
                <input type="number" name='amount' value={data.amount} onChange={handleChange} required className="login-input" />

                <label className="login-label">Spent on Date</label>
                <input type="date" name='spentDate' value={data.spentDate} onChange={handleChange} required className="login-input" />

                <label className="login-label">Category</label>
                <select className="login-input" name='category' value={data.category} onChange={handleChange} required>
                    <option value="">-- Select Category --</option>
                    <option value="food & groceries">Food & Groceries</option>
                    <option value="transport">Transport</option>
                    <option value="education">Education</option>
                    <option value="bills & rent">Bills & Rent</option>
                    <option value="health">Health</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="shopping">Shopping</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                </select>

                <Button disabled={isLoading} type="submit" onClick={createExpense}>Add Expense</Button>
            </form>
        </div>
        </>
    );
}
