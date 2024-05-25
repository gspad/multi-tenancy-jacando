import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const TwoFA = () => {
    const [token, setToken] = useState('');
    const router = useRouter();
    const tenant = useSearchParams().get('tenant');
    const email = useSearchParams().get('email');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/${tenant}/login-step2`, { email, token });
            // Assuming the backend sets a secure HTTP-only cookie with the JWT
            router.push(`/${tenant}/protected`);
        } catch (error) {
            console.error(error);
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
        </div>
    );
};

export default TwoFA;
