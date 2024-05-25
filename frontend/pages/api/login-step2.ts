import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tenant } = req.query;
    const { email, token } = req.body;

    try {
        const response = await axios.post(`http://gateway-service:3000/${tenant}/auth/login-step2`, { email, token }, {
            withCredentials: true
        });
        res.setHeader('Set-Cookie', response.headers['set-cookie'] || []);
        res.status(200).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
}
