import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";



const App = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUser = () => {
      fetch("http://localhost:3333/auth/login/success", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error("authentication has been failed!");
        })
        .then((resObject) => {
          setUser(resObject.user);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getUser();
  }, []);

  const Login = () => {
    const google = () => {
      
    };
  }

  

  const Home = () => {
    return (
      <div>
        <div className="home" onClick={ () => window.open("http://localhost:3333/auth/google", "_self") } >
           pajak + ${user.displayName  }
        </div>
        <div className="home" onClick={ () => window.open("http://localhost:3333/auth/logout", "_self")} >
           logout
        </div>

      </div>


    )
}

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;