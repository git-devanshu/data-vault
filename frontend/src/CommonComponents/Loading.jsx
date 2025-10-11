import React from 'react'
import { Spinner } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons';

export default function Loading({data, error}) {
    return (
        <div style={{height: '100vh', backgroundColor: '#121826', fontFamily: 'sans-serif', display: 'grid', placeItems: 'center', color: 'white'}}>
            {!error && 
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    />
                    <h1 style={{fontSize: '20px', margin: '10px'}}>Loading {data}</h1>
                    <h2 style={{color: 'gray', textAlign: 'center'}}>This may take a while, please do not refresh the page.</h2>
                </div>
            }
            {error && 
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
                    <WarningIcon boxSize={8} color='red.500'/>
                    <h1 style={{fontSize: '20px', margin: '10px'}}>Failed to load {data}</h1>
                    <h2 style={{color: 'gray', textAlign: 'center'}}>Error : {error}</h2>
                </div>
            }
        </div>
    );
}
