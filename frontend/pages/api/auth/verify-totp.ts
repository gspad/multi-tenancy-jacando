import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email, token } = req.body;

    try {
        const response = await axios.post(`http://gateway-service:3000/api/auth/verify-totp`, { email, token });
        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
}
