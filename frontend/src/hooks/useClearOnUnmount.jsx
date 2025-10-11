import { useEffect } from 'react';

const useClearOnUnmount = (clearFunction) => {
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem('preserveKey', 'true');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            const preserve = sessionStorage.getItem('preserveKey');
            
            if (!preserve) {
                clearFunction();
                console.log('Cleared from memory');
            }
            sessionStorage.removeItem('preserveKey');
        };
    }, [clearFunction]);
};

export default useClearOnUnmount;