// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);

  const login = () => {
    window.open(`${url}/auth/google`, "_self")
  };

	const logout = () => {
		window.open(`${url}/auth/logout`, "_self");
	};

  const getUser = async () => {
		try {
			const {data} = await axios.get(`${url}/api/profile`, { withCredentials: true });
			console.log(data);

			setUser(data);
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
