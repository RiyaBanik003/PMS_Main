// services/userService.js
import api from "../../../api/axios";
// services/userService.js


export const createUser = async (userData) => {
    try {
        const response = await api.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.error("Create User Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get("/users");

        console.log("Raw API response:", response.data);

        // Handle different response structures
        let users = [];

        if (response.data && Array.isArray(response.data)) {
            users = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            users = response.data.data;
        } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
            users = response.data.users;
        }

        return {
            success: true,
            data: users
        };
    } catch (error) {
        console.error("Get Users Error:", error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || "Failed to fetch users"
        };
    }
};