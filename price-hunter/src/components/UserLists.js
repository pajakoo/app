import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'
import '../App.css';

const UserLists = () => {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);

    useEffect(() => {
      // Fetch shopping lists when the component mounts
      fetchShoppingLists();
    }, []);
  
    const fetchShoppingLists = async () => {
        try {
          const response = await axios.get(`${url}/api/shopping-lists`);
          console.log('gg:',response.data);
          setShoppingLists(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching shopping lists:', error);
        }
      };
      
  
    if (loading) {
      return <div>Loading...</div>;
    }
  

  return (
    <div>
      <h2>Your Shopping Lists</h2>
      {shoppingLists.length > 0 ? (
        <ul>
          {shoppingLists.map((list) => (
            <li key={list._id}>
              <h3>List ID: {list._id}</h3>
              <p>User ID: {list.userId}</p>
              <ul>
                {list.products.map((product) => (
                  <li key={product.productId}>
                    Product ID: {product.productId}, Quantity: {product.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shopping lists found.</p>
      )}
    </div>
  );
};

export default UserLists;
