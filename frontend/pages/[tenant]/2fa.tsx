import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const LoginStep2 = () => {
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { tenant, email } = router.query;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/${tenant}/login-step2`, { email, token: twoFactorCode });
            Cookies.set('jwt', response.data.jwt, { path: '/' });
            router.push(`/${tenant}/protected`);
        } catch (error: any) {
            setError('Invalid 2FA code');
        }
    };

    return (
        <div>
            <h1>Two-Factor Authentication</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Enter 2FA code"
                    required
                />
                <button type="submit">Verify</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default LoginStep2;

