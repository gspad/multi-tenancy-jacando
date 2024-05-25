import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const TwoFA = () => {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const tenant = useSearchParams().get('tenant');
    const email = useSearchParams().get('email');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/login-step2`, { email, token });
            if (response.status === 200) {
                router.push(`/${tenant}/protected`);
            }
        } catch (error) {
            console.error(error);
            setError('Invalid 2FA token');
        }
    };

    return (
        <div>
            <h1>Two-Factor Authentication</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="2FA Token"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default TwoFA;
