import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const tenant = searchParams.get('tenant');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/${tenant}/login-step1`, { email, password });
            router.push(`/${tenant}/2fa?email=${encodeURIComponent(email)}`);
        } catch (error) {
            console.error(error);
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
                <button type="submit">Next</button>
            </form>
        </div>
    );
};

export default Login;
