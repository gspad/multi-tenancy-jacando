import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tenant } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await axios.get(`http://gateway-service:3000/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-ID': tenant,
            },
        });
        res.status(200).json(response.data);
    } catch (error: any) {
        console.error(error);
        res.status(error.response?.status || 500).json({ message: error.message });
    }
}
