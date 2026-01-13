import client from './client';

export const quizAPI = {
    create: async (data) => {
        const response = await client.post('/api/quiz/create', data);
        return response.data;
    },

    list: async (documentId = null) => {
        const params = documentId ? `?document_id=${documentId}` : '';
        const response = await client.get(`/api/quiz/${params}`);
        return response.data;
    },

    get: async (id, includeAnswers = false) => {
        const response = await client.get(`/api/quiz/${id}?include_answers=${includeAnswers}`);
        return response.data;
    },

    submit: async (data) => {
        const response = await client.post('/api/quiz/submit', data);
        return response.data;
    },

    listResults: async () => {
        const response = await client.get('/api/quiz/results/all');
        return response.data;
    },

    getResult: async (id) => {
        const response = await client.get(`/api/quiz/results/${id}`);
        return response.data;
    },
};
