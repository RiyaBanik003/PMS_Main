import api from '../../../api/axios'
const API_URL = "/projects";

export const createProject = async (projectData, config = {}) => {
    try {
        const isFormData = projectData instanceof FormData;

        const response = await api.post(
            API_URL,
            projectData,
            {
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                },
                ...config
            }
        );

        return response.data;
    } catch (error) {
        console.error("Create Project Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllProjects = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`${API_URL}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Get Projects Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getProjectById = async (projectId) => {
    try {
        const response = await api.get(`${API_URL}/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Get Project Error:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await api.delete(`${API_URL}/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Project Error:", error.response?.data || error.message);
        throw error;
    }
};

export const updateProject = async (projectId, projectData) => {
    try {
        const isFormData = projectData instanceof FormData;

        const response = await api.put(
            `${API_URL}/${projectId}`,
            projectData,
            {
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Update Project Error:", error.response?.data || error.message);
        throw error;
    }
};

export const addProjectMember = async (projectId, userId, data) => {
    try {
        // Use api instead of axios
        const response = await api.post(
            `${API_URL}/${projectId}/members/${userId}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Add Project Member Error:", error.response?.data || error.message);
        throw error;
    }
};