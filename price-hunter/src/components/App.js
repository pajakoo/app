import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';

//cmd+K+cmd+0 folding functions ( unfold  cmd+K +cmd+J )
// Components
import Client from './Client';
import Admin from './Admin';
import UserManagement from './UserManagement';
import { useAuth } from '../AuthProvider'
let deferredPrompt;

// window.addEventListener('beforeinstallprompt', (event) => {
//   // Prevent the default prompt
//   event.preventDefault();
//   // Store the event for later use
//   deferredPrompt = event;
//   // Optionally show your own install button
//   showInstallButton();
// });

// function showInstallButton() {
//   const installButton = document.getElementById('installButton');
//   installButton.style.display = 'block';
//   installButton.addEventListener('click', () => {
//     // Trigger the installation prompt
//     deferredPrompt.prompt();
//     // Wait for the user to respond to the prompt
//     deferredPrompt.userChoice.then((choiceResult) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the install prompt');
//       } else {
//         console.log('User dismissed the install prompt');
//       }
//       // Clear the deferredPrompt variable
//       deferredPrompt = null;
//     });
//   });
// }

// if (window.matchMedia('(display-mode: standalone)').matches) {
//   // The app is already installed
//   document.getElementById('installButton').style.display = 'none';
// }



function App() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, login, logout } = useAuth();
  const [toggleHeader, setToggleHeader] = useState(false);
  const handleToggle = () => {
    setToggleHeader(!toggleHeader);
  };
  const checkUserRights = (roles) => {
    // Check if the user has the 'admin' ro
    //console.log('right', currentUser.roles);
    //return currentUser && currentUser.roles.includes(roles);
    return true;
  };
  const Login = () => {
    return (
      <div>
        <h2>Login</h2>
        <button onClick={login} >Login with Google</button>
      </div>
    );
  };

  const Logout = () => {
    return (
      <div>
        <button className="btn btn-link nav-link" onClick={logout}>
          <i className="fa fa-sign-out"></i> Sign Out
        </button>
      </div>
    );
  };

  const PrivateRoutes = () => {
    return (
      user ? <Outlet /> : <Navigate to="/login" />
    )
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="site-wrapper">
      <Router>
        {/* <button id="installButton">Install App</button> */}
        <header className={toggleHeader ? "left float-start shadow-dark open" : "left float-start shadow-dark  " }>
          <button onClick={handleToggle} type="button" className="close" aria-label="Close"><span aria-hidden="true">×</span></button>
          <div className="header-inner d-flex align-items-start flex-column">
            <a href="/multipage"><img src="https://lh3.googleusercontent.com/a/ACg8ocJdWSeRoFfoxIxkAukFt6fCk69_zkcfP9U1LGwHJ30eEFkv=s96-c" alt="Bako Doe" /></a>
            <a className="site-title dot mt-3" href="/multipage">{user ? user.name : ''}</a>
            <span className="site-slogan">Web Developer</span>
            <nav>
              <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
              {checkUserRights('65660572e8d841f79b8fe614') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/users">
                    Users
                  </Link>
                </li>
              )}
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Logout /> 
              </li>
            </ul>
            </nav>
            <div className="footer mt-auto">
              <ul className="social-icons list-inline">
                <li className="list-inline-item"><a href="https://facebook.com"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
                    </svg></a></li>
                <li className="list-inline-item">
                  <a href="https://twitter.com"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                    </svg></a>
                </li>
                <li className="list-inline-item">
                  <a href="https://www.instagram.com/"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                    </svg></a>
                </li>
                <li className="list-inline-item">
                  <a href="https://www.youtube.com/"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                    </svg></a>
                </li>
                <li className="list-inline-item"><a href="https://dribbble.com/"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M256 8C119.252 8 8 119.252 8 256s111.252 248 248 248 248-111.252 248-248S392.748 8 256 8zm163.97 114.366c29.503 36.046 47.369 81.957 47.835 131.955-6.984-1.477-77.018-15.682-147.502-6.818-5.752-14.041-11.181-26.393-18.617-41.614 78.321-31.977 113.818-77.482 118.284-83.523zM396.421 97.87c-3.81 5.427-35.697 48.286-111.021 76.519-34.712-63.776-73.185-116.168-79.04-124.008 67.176-16.193 137.966 1.27 190.061 47.489zm-230.48-33.25c5.585 7.659 43.438 60.116 78.537 122.509-99.087 26.313-186.36 25.934-195.834 25.809C62.38 147.205 106.678 92.573 165.941 64.62zM44.17 256.323c0-2.166.043-4.322.108-6.473 9.268.19 111.92 1.513 217.706-30.146 6.064 11.868 11.857 23.915 17.174 35.949-76.599 21.575-146.194 83.527-180.531 142.306C64.794 360.405 44.17 310.73 44.17 256.323zm81.807 167.113c22.127-45.233 82.178-103.622 167.579-132.756 29.74 77.283 42.039 142.053 45.189 160.638-68.112 29.013-150.015 21.053-212.768-27.882zm248.38 8.489c-2.171-12.886-13.446-74.897-41.152-151.033 66.38-10.626 124.7 6.768 131.947 9.055-9.442 58.941-43.273 109.844-90.795 141.978z"></path>
                    </svg></a></li>
              </ul>
            </div>
          </div>
        </header>

        <div className={toggleHeader ? "mobile-header py-2 px-3 mt-4 push" : "mobile-header py-2 px-3 mt-4 " }>
          <button onClick={handleToggle}  className="menu-icon me-2"><span></span><span></span><span></span></button>
          <a className="logo" href="/multipage"><img src="https://lh3.googleusercontent.com/a/ACg8ocJdWSeRoFfoxIxkAukFt6fCk69_zkcfP9U1LGwHJ30eEFkv=s96-c" alt="Bako Doe"/></a>
          <a className="site-title dot ms-2" href="/">{user ? user.name : ''}</a>
        </div>
        
        <main className={toggleHeader ? "content float-end push" :  "content float-end"}>
        <Routes>
          <Route element={<Client />} path="/" />
          <Route element={<Admin />} path="/admin" />
          <Route element={<PrivateRoutes />}>
            <Route element={<UserManagement />} path="/users" />
          </Route>
          {user ? <Route element={<Client />} path="/" /> : <Route element={<Login />} path="/login" />}
        </Routes>
      </main>
      </Router>

    </div>
  );
}

export default App;



// https://whatpwacando.today/ ±!!!!!!!!!!!!!!!






// import ReactDOM from 'react-dom/client';

// import React, { useState } from 'react';
// import { CSSTransition } from 'react-transition-group';

// const DashboardScreen = () => {
//   return <div>Dashboard</div>;
// };

// const ProfileScreen = () => {
//   return <div>Profile</div>;
// };

// const TransactionsScreen = () => {
//   return <div>Transactions</div>;
// };

// const TreeScreen = ({ children }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   const handleMenuItemClick = (event) => {
//     event.preventDefault();

//     if (isOpen) {
//       setIsOpen(false);
//     }
//   };

// const nestedList = (treeItems) => {
//   return (
//     <ul>
//       {treeItems.map((item) => (
//         <li key={item.title}>
//           {Array.isArray(item.children) ? (
//             <TreeScreen key={item.title} children={item.children} />
//           ) : (
//             <>{item.title}</>
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };
//   return (
//     <div className="tree-screen">
//       <button onClick={toggleMenu}>Menu</button>

//       {isOpen ? (
//         <CSSTransition
//           in={isOpen}
//           timeout={300}
//           classNames="menu"
//           mountOnEnter
//           unmountOnExit
//         >
//           <div className="menu-content">{nestedList(flattenedTree)}</div>
//         </CSSTransition>
//       ) : (
//         <div className="screen-content">{children}</div>
//       )}
//     </div>
//   );
// };

// const mainTree = [
//   {
//     title: 'Home',
//     children: [
//       { title: 'Dashboard', component: DashboardScreen },
//       { title: 'Profile', component: ProfileScreen },
//       { title: 'Transactions', component: TransactionsScreen },
//     ],
//   },
// ];

// const flattenedTree = mainTree.flat();

// ReactDOM.createRoot(document.querySelector('#root')).render(
//   <TreeScreen children={mainTree} />
// );
