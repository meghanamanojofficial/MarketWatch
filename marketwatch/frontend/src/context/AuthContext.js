import { createContext, useState} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(null);

    const loginUser = (tokens) => {
        setAuthTokens(tokens);
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        // In a real app, you would decode the JWT here to get the user data
        setUser({ isAuthenticated: true }); 
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };

    return (
        <AuthContext.Provider value={{ user, authTokens, loginUser, logoutUser, setAuthTokens }}>
            {children}
        </AuthContext.Provider>
    );
};