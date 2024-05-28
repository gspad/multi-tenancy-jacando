import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Verify2FA = () => {
    const router = useRouter();
    const { email, qrCode, tenant } = router.query;

    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/auth/verify-totp', { email, token }, { withCredentials: true });
            if (response.data.message === '2FA successful') {
                router.push('/protected');
            }
        } catch (error: any) {
            setError('Invalid 2FA token');
        }
    };

    return (
        <div>
            <h1>2FA</h1>
            {qrCode && <img src={qrCode as string} alt="QR Code for 2FA" />}
            <form onSubmit={handleVerify}>
                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="2FA Token"
                    required
                />
                <button type="submit">Verify 2FA</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Verify2FA;
