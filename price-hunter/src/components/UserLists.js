import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { Card, Row, Col } from 'react-bootstrap';
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
      const response = await axios.get(`${url}/api/shopping-lists/${user.userId}`);
      console.log('gg:', response.data);
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
    <section className="shadow-blue white-bg padding">
      <h4 className="mt-4">Запазени Списъци </h4>
      <div className="mb-3 ">
      {shoppingLists.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {shoppingLists.map((list) => (
            <Col key={list._id}>
              <Card>
                <Card.Body>
                  <Card.Title>List ID: {list._id}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">User ID: {list.userId}</Card.Subtitle>
                  <Card.Text>
                    <ul>
                      {list.products.slice(0, 5).map((product) => (
                        <li key={product.productId}>
                          Product ID: {product.productId}, Quantity: {product.quantity}
                        </li>
                      ))}
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>No shopping lists found.</p>
      )}
      </div>
    </section>
  );
};

export default UserLists;
