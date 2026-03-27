import axios from "axios";

const API_URL = "https://pms-l909.onrender.com/api/v1/projects";
const UPDATE_API_URL = "https://pms-l909.onrender.com/api/v1/threads";

export const createThread = async (projectId, threadData) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.post(
            `${API_URL}/${projectId}/threads`,
            threadData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Create Thread Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getThreadsByProjectId = async (projectId) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
            `${API_URL}/${projectId}/threads`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Get Threads Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getThreadById = async (threadId) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
            `https://pms-l909.onrender.com/api/v1/threads/${threadId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Get Thread Error:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteThread = async (threadId) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.delete(
            `https://pms-l909.onrender.com/api/v1/threads/${threadId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Delete Thread Error:", error.response?.data || error.message);
        throw error;
    }
};
// Add this to your threadService.js
export const updateThread = async (threadId, threadData) => {
    try {
        const token = localStorage.getItem("accessToken");
        
        const response = await axios.put(
            `${UPDATE_API_URL}/${threadId}`,
            threadData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Update Thread Error:", error.response?.data || error.message);
        throw error;
    }
};