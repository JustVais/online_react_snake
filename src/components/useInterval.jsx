import { useRef, useEffect } from 'react';

const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        let tick = () => savedCallback.current();

        let interval = setInterval(tick, delay);

        return (() => {
            clearInterval(interval)
        });
    }, [delay]);
}


export default useInterval;