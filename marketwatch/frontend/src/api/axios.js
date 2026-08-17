import axios from 'axios';

const baseURL = 'http://172.31.170.48:8000';

const axiosInstance = axios.create({
    baseURL: baseURL,
});

// We will attach the interceptors inside a custom hook in the next step
// so it has access to the AuthContext to update tokens.

export default axiosInstance;