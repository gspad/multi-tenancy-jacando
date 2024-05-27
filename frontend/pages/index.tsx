import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Home = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/login-step1`, { email, password });
            const { tenant } = response.data;
            router.push(`/${tenant}/2fa?email=${encodeURIComponent(email)}`);
        } catch (error) {
            console.error(error);
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
                <button type="submit">Next</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Home;
