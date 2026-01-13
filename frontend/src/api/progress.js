import client from './client';

export const progressAPI = {
    getOverview: async () => {
        const response = await client.get('/api/progress/overview');
        return response.data;
    },

    getDetailed: async () => {
        const response = await client.get('/api/progress/detailed');
        return response.data;
    },

    logActivity: async (studyTime) => {
        const response = await client.post(`/api/progress/log-activity?study_time=${studyTime}`);
        return response.data;
    },
};
