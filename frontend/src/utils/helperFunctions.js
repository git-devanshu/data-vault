// decode the JWT and return the payload
export function decodeToken(token) {
    try {
        if(!token){
            return null;
        }
        const base64Url = token.split('.')[1]; // Get the payload part
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64URL to Base64
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload); // Parse JSON payload
    } 
    catch (error) {
        console.error('Invalid token: ', error);
        return null;
    }
}


// function to fetch the server's base URL
export function getBaseURL() {
    return import.meta.env.VITE_SERVER_URL;
}


// functions to manage API versions
export function primaryAPIVersion() {
    return import.meta.env.VITE_PRIMARY_API_VERSION;
}

export function secondaryAPIVersion() {
    return import.meta.env.VITE_SECONDARY_API_VERSION;
}


// functions to handle the JWT
export function saveAuthToken(token) {
    localStorage.setItem('token', token);
}

export function getAuthToken() {
    const token = localStorage.getItem('token');
    return token;
}

export function removeAuthToken() {
    localStorage.removeItem('token');
}

export function generateNoteId(){
    return crypto.randomUUID();
}

//function to get the current date in different formats
/*
type values : 
1 - DD-MM-YYYY
2 - DD M_name, YYYY
3 - D_name DD M_name, YYYY
4 - YYYY
5 - hh:mm
6 - YYYY-MM
else - YYYY-MM-DD
*/
export function getCurrentDate(type){
    const date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth();
    var m_name = date.toLocaleString('default', {month : 'long'});
    var yy = date.getFullYear();
    var d_name = date.toLocaleString('default', {weekday : 'long'});
    var h = date.getHours();
    var min = date.getMinutes();

    if(type === 1){
        return dd + '-' + (mm+1) + '-' + yy;
    }
    else if(type === 2){
        return dd + ' ' + m_name + ', ' + yy;
    }
    else if(type === 3){
        return d_name + ' ' + dd + ' ' + m_name + ', ' + yy;
    }
    else if(type === 4){
        return yy;
    }
    else if(type === 5){
        return h.toString(10).padStart(2, '0') + ':' + min.toString(10).padStart(2, '0');
    }
    else if(type === 6){
        return yy + '-' + (mm+1).toString(10).padStart(2, '0');
    }
    else{
        return yy + '-' + (mm+1) + '-' + dd;
    }
}