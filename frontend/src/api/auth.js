import client from './client';

export const authAPI = {
    register: async (data) => {
        const response = await client.post('/api/auth/register', data);
        return response.data;
    },

    login: async (data) => {
        const response = await client.post('/api/auth/login', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await client.get('/api/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await client.put('/api/auth/me', data);
        return response.data;
    },
};
