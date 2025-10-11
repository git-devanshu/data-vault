import axios from 'axios'
import { getAuthToken, getBaseURL } from '../utils/helperFunctions'

// fetch data directly
export function fetchData(path, setData, setError) {
    const token = getAuthToken();
    axios.get(getBaseURL() + path, {headers : {
        Authorization : `Bearer ${token}`
    }})
    .then(res =>{
        if(res.status === 200){
            setData(res.data);
        }
    })
    .catch(err =>{
        console.log(err);
        setError('Failed to load the data');
    })
}



        // const toastId = toast.loading('Loading...');

        // axios.post(getBaseURL() + `/api/`)
        // .then(res =>{
        //     if(res.status === 200){
        //         toast.success(res.data.message, {id : toastId});
        //     }
        // })
        // .catch(err =>{
        //     console.log(err);
        //     toast.error(err.response.data.message, {id : toastId});
        // })