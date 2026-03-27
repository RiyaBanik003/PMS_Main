// services/userService.js
import api from '../../../api/axios';

export const getAllUsers = async () => {
    try {
        const response = await api.get("/users");

        console.log("Users fetched API response:", response.data);

        // Extract users array from different possible response formats
        let users = [];
        const data = response.data;

        if (Array.isArray(data)) {
            users = data;  // Direct array
        } else if (data && Array.isArray(data.users)) {
            users = data.users;  // data.users format
        } else if (data && Array.isArray(data.data)) {
            users = data.data;  // data.data format
        } else if (data && data.user && Array.isArray(data.user)) {
            users = data.user;  // data.user format
        }

        // Return in the expected format
        return {
            success: true,
            data: users,
            message: data.message || null
        };
    } catch (error) {
        console.error("Get Users Error:", error.response?.data || error.message);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || "Failed to fetch users"
        };
    }
};