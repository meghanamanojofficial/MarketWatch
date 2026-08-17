import { useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const useAxiosPrivate = () => {
    const { authTokens, setAuthTokens, logoutUser } = useContext(AuthContext);

    useEffect(() => {
        const requestIntercept = axiosInstance.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization'] && authTokens?.access) {
                    config.headers['Authorization'] = `Bearer ${authTokens.access}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true; // Prevent infinite loops
                    try {
                        const response = await axios.post('http://172.31.170.48:8000/api/token/refresh/', {
                            refresh: authTokens.refresh
                        });
                        
                        const newTokens = {
                            ...authTokens,
                            access: response.data.access
                        };
                        
                        setAuthTokens(newTokens);
                        localStorage.setItem('authTokens', JSON.stringify(newTokens));
                        
                        prevRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                        return axiosInstance(prevRequest);
                    } catch (refreshError) {
                        // If the refresh token is also expired, log them out
                        logoutUser();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
    }, [authTokens, setAuthTokens, logoutUser]);

    return axiosInstance;
};

export default useAxiosPrivate;