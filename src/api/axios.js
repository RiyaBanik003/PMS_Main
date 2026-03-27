import axios from "axios";

const api = axios.create({
    baseURL: "https://pms-l909.onrender.com/api/v1",
    withCredentials: true,
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or already retried, reject
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const response = await api.post('/auth/refresh');
            const { accessToken } = response.data;

            localStorage.setItem("accessToken", accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            processQueue(null, accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;