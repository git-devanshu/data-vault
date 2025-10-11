import {createMasterKey, encryptMasterKey, decryptMasterKey, encryptData, decryptData} from './utils/cipherFunctions.js';

const password = "Judsgfu58dgJDGd@7dschu";
const securityPin = "464228";

let passEncKey, passSalt, passNonce, pinEncKey, pinSalt, pinNonce;
let passDecMasterKey, pinDecMasterKey;

const data1 = "he heeee...! Mummy";
let encData1, decData1, nonce1;

const data2 = {
    platform : "Mongo DB Atlas",
    username : "devanshulanjudkar9@gmail.com",
    password : "google OAuth",
    label : "Other"
}
let encData2, decData2, nonce2;

const masterKey = createMasterKey();
console.log("Master Key : ", masterKey);

async function testKeyEncryption(){
    const passEncKeyData = await encryptMasterKey(masterKey, password);

    passEncKey = passEncKeyData.encryptedMasterKey;
    passSalt = passEncKeyData.salt;
    passNonce = passEncKeyData.nonce;

    console.log("Pass enc key : ", passEncKey);
    console.log("Pass salt : ", passSalt);
    console.log("Pass nonce : ", passNonce);

    const pinEncKeyData = await encryptMasterKey(masterKey, securityPin);

    pinEncKey = pinEncKeyData.encryptedMasterKey;
    pinSalt = pinEncKeyData.salt;
    pinNonce = pinEncKeyData.nonce;

    console.log("Pin enc key : ", pinEncKey);
    console.log("Pin salt : ", pinSalt);
    console.log("Pin nonce : ", pinNonce);
}

async function testKeyDecryption(){
    passDecMasterKey = await decryptMasterKey(passEncKey, password, passSalt, passNonce);
    console.log("Password Decrypted Key : ", passDecMasterKey);

    pinDecMasterKey = await decryptMasterKey(pinEncKey, securityPin, pinSalt, pinNonce);
    console.log("Pin Decrypted Key : ", pinDecMasterKey);
}

async function testDataEncryption(){
    const encDataObj1 = await encryptData(data1, masterKey);
    encData1 = encDataObj1.encryptedData;
    nonce1 = encDataObj1.nonce;
    console.log("Encrypted data 1 : ", encData1);
    console.log("Nonce 1 : ", nonce1);

    const encDataObj2 = await encryptData(JSON.stringify(data2), masterKey);
    encData2 = encDataObj2.encryptedData;
    nonce2 = encDataObj2.nonce;
    console.log("Encrypted data 2 : ", encData2);
    console.log("Nonce 2 : ", nonce2);
}

async function testDataDecryption(){
    decData1 = await decryptData(encData1, nonce1, pinDecMasterKey);
    console.log("Decrypted data 1 : ", decData1);

    decData2 = JSON.parse(await decryptData(encData2, nonce2, pinDecMasterKey));
    console.log("Decrypted data 2 : ", decData2);
}


await testKeyEncryption();
await testKeyDecryption();

await testDataEncryption();
await testDataDecryption();
