import { useState, useEffect } from 'react';

export const usePaystackScript = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // If script is already in the DOM, set state to true
        if (document.getElementById('paystack-script')) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = 'paystack-script';
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;

        const onScriptLoad = () => {
            setLoaded(true);
            setError(false);
            console.log('UsePaystackScript: Paystack inline script loaded successfully.');
        };

        const onScriptError = () => {
            setLoaded(false);
            setError(true);
            console.error('UsePaystackScript: Failed to load Paystack script.');
        };

        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);

        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', onScriptLoad);
            script.removeEventListener('error', onScriptError);
        };
    }, []);

    return { loaded, error };
};
