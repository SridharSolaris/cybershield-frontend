import axios from 'axios';

const setupAxiosInterceptors = (logout, navigate) => {
    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                console.log("Token expired or invalid");
                logout();
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );

    // Add token to requests
    axios.interceptors.request.use(
        config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );
};

export default setupAxiosInterceptors;
