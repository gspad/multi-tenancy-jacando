import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface User {
    id: string;
    email: string;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();
    const { tenant } = router.query;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`/api/${tenant}/users`, {
                    withCredentials: true,
                });
                setUsers(response.data);
            } catch (error: any) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    router.push(`/${tenant}/login`);
                }
            }
        };

        fetchUsers();
    }, [tenant]);

    return (
        <div>
            <h1>List of Users</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default Users;
