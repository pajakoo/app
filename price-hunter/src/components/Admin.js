import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/library';
import GoogleMapReact from 'google-map-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faX } from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { useAuth } from '../AuthProvider';
import { DNA } from 'react-loader-spinner';
import axios from 'axios';

function Admin() {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [barcode, setBarcode] = useState('');
  const [disabledName, setDisabledName] = useState(false);
  const [store, setStore] = useState(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [name, setName] = useState('');
  const [stores, setStores] = useState([]);
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const { user } = useAuth();
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const Marker = () => <div className="marker"><span role="img">📍</span></div>;
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    setShowPreloader(true);

    // Fetch products
    axios.get(`${url}/api/products`, { params: { addedBy: user._id } })
      .then(response => {
        setProducts(response.data);
        setShowPreloader(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

    // Fetch stores
    axios.get(`${url}/api/stores`)
      .then(response => {
        setStores(response.data);
      })
      .catch(error => {
        console.error('Error fetching stores:', error);
      });

    // Get video devices
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoDevices);
      });

    // Get current location
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
      },
      error => {
        console.error('Error fetching current location:', error);
      }
    );
  }, [user, navigate, url]);

  useEffect(() => {
    if (selectedCamera) {
      codeReader.current = new BrowserMultiFormatReader();

      const startScanner = async () => {
        try {
          const constraints = {
            video: {
              aspectRatio: 1.7777777778,
              focusMode: 'continuous',
              width: { ideal: 200 },
              height: { ideal: 100 },
            },
          };

          await codeReader.current.decodeFromVideoDevice(null, videoRef.current, result => {
            if (result !== null) {
              const barcode = result.getText();
              setBarcode(barcode);
              console.log('Scanned barcode:', barcode);
            }
          }, constraints);
        } catch (error) {
          console.error('Failed to start barcode scanner:', error);
        }
      };

      startScanner();

      return () => {
        codeReader.current.reset();
      };
    }
  }, [selectedCamera]);

  const handleNameFieldClick = async () => {
    try {
      const response = await axios.get(`${url}/api/products/${barcode}`);
      if (response.status === 200) {
        const product = response.data;
        setName(product.name);
        setDisabledName(product.length > 0);
      } else {
        console.error('Error fetching product');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleInputChange = (selected) => {
    if (selected.length > 0) {
      setStore(selected[0]);
      setNewStoreName(selected[0].name);
    } else {
      setStore(null);
      setNewStoreName('');
    }
  };

  const handleClearStore = () => {
    setStore(null);
    setNewStoreName('');
  };

  const handleAddProduct = async () => {
    try {
      if (store && !stores.some(s => s.name === store.name)) {
        setShowPreloader(true);
        const response = await axios.post(`${url}/api/stores`, { name: store.name });
        if (response.status === 200) {
          const newStoreData = response.data;
          setStores([...stores, newStoreData]);
        } else {
          console.error('Error creating store');
        }
      }

      const response = await axios.post(`${url}/api/products`, {
        barcode,
        name,
        price,
        store: store ? store.name : newStoreName,
        location: currentLocation,
        userId: user._id
      });

      if (response.status === 200) {
        const productsData = await axios.get(`${url}/api/products`, { params: { addedBy: user._id } });
        setProducts(productsData.data);
        setShowPreloader(false);
        setBarcode('');
        setName('');
        setPrice('');
        setStore('');
        setNewStoreName('');
      } else {
        console.error('Error creating product');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleDeletePrice = async (priceId) => {
    try {
      const response = await axios.delete(`${url}/api/prices/${priceId}`, { params: { addedBy: user._id } });
      if (response.status === 200) {
        alert(response.data.message);
        // Refresh products or update state if needed
      } else {
        console.error('Error deleting price');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('An error occurred while deleting the price.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setShowPreloader(true);
      const response = await axios.delete(`${url}/api/products/${productId}`);
      if (response.status === 200) {
        const productsData = await axios.get(`${url}/api/products`, { params: { addedBy: user._id } });
        setProducts(productsData.data);
        setShowPreloader(false);
      } else {
        console.error('Error deleting product');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  // Function to format date in Bulgarian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    });
  };


  return (
    <section className="shadow-blue white-bg padding section-min-hight-620">
      <h4 className="mt-4">Добави продукт по баркод</h4>
      <div className="mb-3">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={barcode}
            onChange={(e) => { setBarcode(e.target.value); setDisabledName(false) }}
            placeholder="Баркод или сериен номер"
          />
          <input
            type="text"
            className="form-control"
            value={name}
            disabled={disabledName}
            onChange={(e) => setName(e.target.value)}
            onClick={handleNameFieldClick}
            placeholder="Име"
          />
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
          />
          <Typeahead
            id="storeTypeahead"
            options={stores}
            labelKey="name"
            placeholder="Магазин"
            selected={store ? [store] : []}
            onChange={handleInputChange}
            renderInput={({ inputRef, referenceElementRef, ...props }) => (
              <div className="input-group">
                <input
                  {...props}
                  ref={(ref) => {
                    inputRef(ref);
                    inputRef.current = ref; // Assign the ref to inputRef.current
                  }}
                  className="form-control"
                  onBlur={(e) => { setNewStoreName(e.target.value); }} // Attach onBlur event handler
                />
                {store && (
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn"
                      onClick={handleClearStore}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" onClick={handleAddProduct}>Добави продукт</button>
          </div>
        </div>
        <h4>Добавени от мен продукти</h4>
        <DNA
          visible={showPreloader}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
        <ul className="list-group">
          {products.map((product, index) => (
            <li className="list-group-item" key={index}>
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <b>Баркод: {product.barcode}</b><br />
                  </div>
                  <button className="btn btn-link" onClick={() => handleDeleteProduct(product._id)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
                <div className="mt-2">
                  <div>
                    <span className="font-weight-bold">Име:</span> {product.name}
                  </div>
                  <div>
                  </div>
                  <div><span className="font-weight-bold">Магазини:</span>
                    <ul>
                      {product && product.prices.map((store, i) => (
                        <li key={i} style={{ listStyleType: 'none', margin: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {store.store.name} - {store.price.$numberDecimal}лв. на 
                          <span style={{ marginLeft: '10px', color:'grey' }}>
                            {formatDate(store.date)} {/* Format and display the date */}
                          </span>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f40606',
                              cursor: 'pointer',
                              padding: '0 0 0 12px',
                              fontSize: '14px',
                            }}
                            onClick={() => handleDeletePrice(store.priceId)}
                          >
                            <FontAwesomeIcon style={{ color: "#f40606", fontSize: "12px" }} icon={faX} />
                          </button>
                        </div>
                      </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Admin;
