import axios from "axios";

// Use the correct base URL for tasks
const TASKS_API_URL = "https://pms-l909.onrender.com/api/v1/tasks";
const THREADS_API_URL = "https://pms-l909.onrender.com/api/v1/threads";

export const createTask = async (threadId, taskData) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.post(
            `${THREADS_API_URL}/${threadId}/tasks`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Create Task Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getTasksByThreadId = async (threadId) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
            `${THREADS_API_URL}/${threadId}/tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Get Tasks Error:", error.response?.data || error.message);
        throw error;
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.put(
            `${TASKS_API_URL}/${taskId}`, // Changed to tasks API
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Update Task Error:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        const token = localStorage.getItem("accessToken");
        
        console.log("Deleting task with ID:", taskId);
        console.log("API URL:", `${TASKS_API_URL}/${taskId}`);
        console.log("Token exists:", !!token);

        const response = await axios.delete(
            `${TASKS_API_URL}/${taskId}`, // Changed to tasks API
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Delete response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete Task Error:", error.response?.data || error.message);
        console.error("Error status:", error.response?.status);
        console.error("Error details:", error.response?.data);
        throw error;
    }
};

// Add this to your taskService.js
export const getTaskById = async (taskId) => {
    try {
        const token = localStorage.getItem("accessToken");
        
        const response = await axios.get(
            `${TASKS_API_URL}/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Get Task Error:", error.response?.data || error.message);
        throw error;
    }
};