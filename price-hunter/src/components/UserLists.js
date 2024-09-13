import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faSave, faLineChart, faLocationArrow} from '@fortawesome/free-solid-svg-icons';
import Modal from "../components/Modal"
import { DNA } from 'react-loader-spinner'
import { Link} from 'react-router-dom';
import '../App.css';

const UserLists = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const [cheapestStores, setCheapestStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  useEffect(() => {
  
    // Fetch shopping lists when the component mounts
    fetchShoppingLists();
  }, []);

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const fetchShoppingLists = async () => {
    try {
      setShowPreloader(true);
      const response = await axios.get(`${url}/api/shopping-lists/${user._id}`);
      setShoppingLists(response.data);
      // setLoading(false);
      setShowPreloader(false);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const response = await fetch(`${url}/api/shopping-lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Грешка при изтриване на листата');
        return;
      }

      // uncomment here
      // const productsData = await fetch(`${url}/api/products?addedBy=${user._id}`).then((res) => res.json());
      // setProducts(productsData);
    } catch (error) {
      console.error('Грешка при изпращане на заявката', error);
    }
  };


  

  // if (loading) {
  //   return  (<section className="shadow-blue white-bg padding">
  //   <h4 className="mt-4">Запазени Списъци </h4>
  //   <div className="mb-3 "><div>Зареждане...</div></div></section>);
  // }

  return (
    <section className="shadow-blue white-bg padding">
      <h4 className="mt-4">Запазени Списъци </h4>
      <div className="mb-3 ">
     
        {shoppingLists.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-4">
            {shoppingLists.map((list, i) => (
              <Col key={i} >
                <Card>
                  <Card.Body>
                    <Card.Title>{list.listName}</Card.Title><button className="btn btn-link" onClick={() => handleDeleteList(list.listId)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                    {/* <Card.Subtitle className="mb-2 text-muted">User ID: {list.userId}</Card.Subtitle> */}
                    <ul>
                      {list.products.map((product) => (
                        <li key={product.productId}>
                        {product.name}
                        </li>
                      ))}
                    </ul>
                    <Card.Footer><Button onClick={async()=>{
                      try {
                        const response = await axios.post(`${url}/api/cheapest`, JSON.stringify(list.products), {
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                        setCheapestStores(response.data);
                        toggleShowModal()
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}>Намери изгодно</Button></Card.Footer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (<>
          <DNA
          visible={showPreloader}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
          /> 
          {!showPreloader && <p>Нямате запазени списъци.<Link className="nav-link" to="/client" >Създайте тук.</Link> </p>}</>
        )}
      </div>
      <Modal showConfirmBtn={false} show={showModal} content={()=>{return (<>
        {cheapestStores.length > 0 ? (
        <div>
          <h4>Най-евтини места за покупка:</h4>
          <ul className="list-group mb-5">
            {cheapestStores.map((store, index) => (
              <li key={index} className="list-group-item">
                <div>
                  В <b>{store.store}</b> можете да го закупите за обща сума от{' '}
                  <b>
                    {new Intl.NumberFormat('bg-BG', {
                      style: 'currency',
                      currency: 'BGN',
                    }).format(store.totalPrice.toString())}
                  </b>
                </div>

              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="mb-5">Няма намерени резултати.</p>
        </div>
      )}
    </>)}}  onCloseButtonClick={ toggleShowModal}  />
    </section>
  );
};

export default UserLists;
