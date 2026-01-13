import client from './client';

export const documentsAPI = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post('/api/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    list: async (page = 1, limit = 10) => {
        const response = await client.get(`/api/documents/?page=${page}&limit=${limit}`);
        return response.data;
    },

    get: async (id) => {
        const response = await client.get(`/api/documents/${id}`);
        return response.data;
    },

    delete: async (id) => {
        await client.delete(`/api/documents/${id}`);
    },

    reprocess: async (id) => {
        const response = await client.post(`/api/documents/${id}/reprocess`);
        return response.data;
    },
};
