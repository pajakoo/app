// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = () => {
    window.open(`/auth/google`, "_self")
  };

	const logout = () => {
		window.open(`/auth/logout`, "_self");
	};

  const getUser = async () => {
		try {
			const { data } = await axios.get(`/profile`, { withCredentials: true });
			setUser(data._json);
		} catch (err) {
			console.log(err);
		}
	};

  useEffect(() => {
		getUser();
	}, []);


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
