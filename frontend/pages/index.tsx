// pages/login.tsx

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
            const { message, qrCode, tenant } = response.data;

            // the fields to check for should be either some boolean or status fields instead of these brittle strings, 
            // i.e. { requires2FA: boolean } or { status: '2FA_REQUIRED' }
            if (message === '2FA required' || message === '2FA not set up') {
                router.push({
                    pathname: `${tenant}/verify-2fa`,
                    query: { email, qrCode, tenant },
                });
            } else if (message === 'Login successful') {
                router.push('/protected');
            } else {
                setError(response.data.message);
            }
        } catch (error: any) {
            setError('Invalid email or password');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;
