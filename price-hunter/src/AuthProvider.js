// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from './firebase'
import axios from 'axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const navigate = useNavigate();



  const login = async() => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');

    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };

  const checkIfUserIsLoggedIn = () => {
    const storedUser = localStorage.getItem('user');
    return Boolean(storedUser);
  };

  const logout = async () => {
    // window.open(`${url}/auth/logout`, "_self");
    try {
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success !== false) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getUser = async () => {
  //   try {
  //     const { data } = await axios.get('/api/profile', { withCredentials: true });
  //     console.log(data);

  //     setUser(data);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // useEffect(() => {
  //   getUser();
  // }, []);


  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') ));
  },[])

  return (
    <AuthContext.Provider value={{ user, login, logout, checkIfUserIsLoggedIn }}>
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
