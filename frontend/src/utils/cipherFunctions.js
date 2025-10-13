import bcrypt, { hash } from 'bcryptjs';


// hash the security pin and password
export function createHash(plainInput) {
    const saltRounds = 12;
    const hashedOutput = bcrypt.hashSync(plainInput, saltRounds);
    return hashedOutput;
}


// generate random secret key for user of 32 bytes = 256 bits
// @returns : masterKey - unit8Array
export function createMasterKey() {
    const masterKey = new Uint8Array(32);
    crypto.getRandomValues(masterKey);
    return masterKey;
}


// generate random secret key for user of 64 bytes = 512 bits
// @returns : passKey - string
export function createPassKey() {
    const passKey = new Uint8Array(64);
    crypto.getRandomValues(passKey);
    return arrayToBase64(passKey);
}


// helper functions for conversion unit8Array <---> base64 string
function arrayToBase64(array) {
    return btoa(String.fromCharCode(...array));
}

function base64ToArray(base64String) {
    return Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
}


// helper function to Derive key using PBKDF2 (deterministic)
// @params : password - string, salt - Uint8Array
// @returns : derived key (32 bytes) - Uint8Array
async function deriveKeyWithPBKDF2(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 10000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    
    return new Uint8Array(derivedBits);
}


// encrypt the master key using the password or security pin as encryptionKeyBase
// @params : masterKey - Uint8Array, encryptionKeyBase - string
// @returns : encryptedMasterKey: string, salt: string, nonce: string
export async function encryptMasterKey(masterKey, encryptionKeyBase) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    const derivedEncryptionKey = await deriveKeyWithPBKDF2(encryptionKeyBase, salt);
    
    const algorithm = { name: 'AES-GCM', iv: nonce };
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        derivedEncryptionKey,
        algorithm,
        false,
        ['encrypt']
    );
    
    const encryptedMasterKey = await crypto.subtle.encrypt(algorithm, cryptoKey, masterKey);
    
    return {
        encryptedMasterKey: arrayToBase64(new Uint8Array(encryptedMasterKey)),
        salt: arrayToBase64(salt),
        nonce: arrayToBase64(nonce)
    };
}


// decrypt the master key using the password or security pin as decryptionKeyBase
// @params : encryptedMasterKeyBase64 - string, decryptionKeyBase - string, saltBase64 - string, nonceBase64 - string
// @returns : decrypted master key - Uint8Array
export async function decryptMasterKey(encryptedMasterKeyBase64, decryptionKeyBase, saltBase64, nonceBase64) {
    const encryptedMasterKey = base64ToArray(encryptedMasterKeyBase64);
    const salt = base64ToArray(saltBase64);
    const nonce = base64ToArray(nonceBase64);
    
    const derivedDecryptionKey = await deriveKeyWithPBKDF2(decryptionKeyBase, salt);
    
    const algorithm = { name: 'AES-GCM', iv: nonce };
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        derivedDecryptionKey,
        algorithm,
        false,
        ['decrypt']
    );
    
    try{
        const decryptedMasterKey = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedMasterKey);
        return new Uint8Array(decryptedMasterKey);
    } 
    catch(error){
        throw new Error('Key decryption failed - incorrect or corrupted data');
    }
}


// encrypt the user data using the master key
// @params : plainData - string, masterKey - unit8Array
// @returns : encryptedData - string, nonce - string
export async function encryptData(plainData, masterKey) {
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const dataBytes = new TextEncoder().encode(plainData);

    const algorithm = { name: 'AES-GCM', iv: nonce };
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        masterKey,
        algorithm,
        false,
        ['encrypt']
    );

    const encryptedData = await crypto.subtle.encrypt(algorithm, cryptoKey, dataBytes);

    return {
        encryptedData: arrayToBase64(new Uint8Array(encryptedData)),
        nonce: arrayToBase64(nonce)
    };
}


// decrypt the user data using the master key
// @params : encryptedDataBase64 - string, nonceBase64 - string, masterKey - unit8Array
// @returns : decryptedData - string
export async function decryptData(encryptedDataBase64, nonceBase64, masterKey) {
    const encryptedData = base64ToArray(encryptedDataBase64);
    const nonce = base64ToArray(nonceBase64);

    const algorithm = { name: 'AES-GCM', iv: nonce };
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        masterKey,
        algorithm,
        false,
        ['decrypt']
    );

    try{
        const decryptedBytes = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedData);
        return new TextDecoder().decode(decryptedBytes);
    } 
    catch(error){
        throw new Error('Decryption failed');
    }
}