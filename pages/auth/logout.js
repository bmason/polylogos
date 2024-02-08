import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../providers/Auth'

const Logout = () => {
    const { push } = useRouter();

    useEffect(() => {
        push('/');
    }, [push]);

    return <></>;
}

export default Logout;