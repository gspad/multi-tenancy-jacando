import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`http://gateway-service:3000/api/auth/login-step1`, { email, password });
        const { message, tenant } = response.data;
        res.status(response.status).json({ message, tenant });
    } catch (error: any) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
}
