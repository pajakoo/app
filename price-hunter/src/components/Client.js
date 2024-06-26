import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faSave, faLineChart, faLocationArrow} from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';

import Modal from "../components/Modal"
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import 'chartjs-adapter-moment';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './styles.css';

// import required modules
import { Parallax, Pagination, Navigation } from 'swiper/modules';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import axios from 'axios';
import { useAuth } from '../AuthProvider'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function Client() {
  const [inputValue, setInputValue] = useState('');
  const [shoppingListsCarousel, setShoppingListsCarousel] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stores, setStores] = useState([]);
  const [cheapestStores, setCheapestStores] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [productPriceHistories, setProductPriceHistories] = useState({});
  const [chartInstance, setChartInstance] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductSelected, setIsProductSelected] = useState(false);
  const [isStoreSelected, setisStoreSelected] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreLocation, setSelectedStoreLocation] = useState(null);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const [selectedProduct1, setSelectedProduct1] = useState(null);
  const { user, login } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [store, setStore] = useState(null);
  const [newStoreName, setNewStoreName] = useState('');

  const [name, setName] = useState('');
  const typeaheadRef = useRef(null);
  // console.log(process.env.FIREBASE_API_KEY,'gg', process.env.REACT_APP_GOOGLE_API_KEY);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });

  const navigate = useNavigate();
  
  const [chartDataConfig, setChartDataConfig] = useState({
    labels: [],
    datasets: [],
  });

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const findProductInStores = async (productId) => {
    try {
      const response = await axios.get(`${url}/api/products/stores/${productId}`, { withCredentials: true });
      const storesData = response.data;
      setStores(storesData);
    } catch (err) {
      console.error(err);
    }
  };
  
  const getStores = async () => {
		try {
			const { data } = await axios.get(`${url}/api/stores`, { withCredentials: true });
      setStores(data);
		} catch (err) {
			console.log(err);
		}
	};


  useEffect(() => {
		getStores();
	}, []);

  
  useEffect(() => {
    fetch(`${url}/api/products-client`)
      .then((response) => response.json())
      .then((data) => {
        setSuggestedProducts(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      
      // fetch(`${url}/api/stores`)
      // .then((response) => response.json())
      // .then((data) => {
      //   setStores(data);
      // })
      // .catch((error) => {
      //   console.error('Error:', error);
      // });

  }, []);
 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // setSelectedStoreLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
  
    if (isProductSelected && isStoreSelected && selectedProduct) {
    console.log('pajak:', selectedProduct.barcode , selectedStore );

      fetchPriceHistoryForStore(selectedProduct.barcode, selectedProduct._id, selectedStore._id);
    }else if(isProductSelected&&selectedProduct){
      fetchPriceHistory(selectedProduct.barcode, selectedProduct._id);
    }
  }, [isProductSelected, isStoreSelected, selectedProduct, selectedStore]);
  

  useEffect(() => {
    // console.log('pajak',selectedStoreLocation)
    if (Object.keys(productPriceHistories).length > 0) {
      createChart();
    }
  }, [productPriceHistories]);

  const fetchPriceHistoryForStore = (barcode, productId, storeId) => {
    fetch(`${url}/api/product/${barcode}/prices/${storeId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log('success');

      if (data.status != false){

      } else {
        setisStoreSelected(false);
      }
      setProductPriceHistories((prevHistories) => ({
        ...prevHistories,
        [productId]: data,
      }));
    }).catch((error) => {

      console.error('Error:', error);
    });
  }

  const fetchPriceHistory = (barcode, productId) => {
    fetch(`${url}/api/product/${barcode}/history`)
      .then((response) => response.json())
      .then((data) => {
        setProductPriceHistories((prevHistories) => ({
          ...prevHistories,
          [productId]: data,
        }));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleInputChange = (selected) => {
    const inputElement = typeaheadRef.current?.inputNode; // Access the inputNode of the Typeahead component
    inputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // if (inputElement) {
    //   inputElement.readOnly = true;
    // }

    if (selected && selected.length > 0) {
      const selectedProduct1 = selected[0];
      const isProductAlreadyAdded = shoppingList.some((product) => product.name === selectedProduct1.name);
      if (!isProductAlreadyAdded) {
        setShoppingList((prevList) => [...prevList, selectedProduct1]);
      }
    } else {
      setInputValue('');
    }
  };

  const handleRemoveProduct = (product) => {
    setShoppingList((prevList) => prevList.filter((p) => p._id !== product._id));
    if ( cheapestStores.length < 1) setShowMap(false);
    setProductPriceHistories((prevHistories) => {
      const updatedHistories = { ...prevHistories };
      delete updatedHistories[product._id];
      return updatedHistories;
    });
    setChartDataConfig({labels:[]});
  };

  const handleSaveList = async () => {
    // console.log('pppp',user);
    try {
      // Assuming your server endpoint for saving a shopping list is '/api/shopping-lists'
      const response = await axios.post(`${url}/api/shopping-lists`, {
        userId: user._id,
        listName:name,
        products: shoppingList.map(product => ({
          productId: product._id,
          quantity: 1, // You can adjust the quantity as needed
        })),
      });

      // Handle success, e.g., show a success message
      console.log('Shopping list saved successfully');

      // Optionally, you can reset the shopping list after saving
      setShoppingList([]);
      setShowModal(!showModal);
      navigate('/user-lists');
      return response.data; // You can return the response data if needed
    } catch (error) {
      // Handle errors, e.g., show an error message
      console.error('Error saving the shopping list:', error.message);
      throw error; // Re-throw the error to handle it further if needed
    }
  };

  const handleFindCheapest = async() => {
    if (shoppingList.length === 0) {
      return;
    }

    const selectedProduct = shoppingList[0];
    const { barcode } = selectedProduct;
 

    try {
      const response = await axios.post(`${url}/api/cheapest`, JSON.stringify(shoppingList), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setCheapestStores(response.data);
      setShowMap(true);

    } catch (error) {
      console.error('Error:', error);
    }



    // fetch(`${url}/api/cheapest`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(shoppingList),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     //console.log(data);
    //     setCheapestStores(data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
  };

  const handleStoreClick = (store) => {
    setSelectedStoreLocation(store);
  };

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const createChart = () => {
    const newChartDataConfig = {
      labels: [],
      datasets: [],
    };

    shoppingList.forEach((product) => {
      const history = productPriceHistories[product._id];
      console.log('history',history);

      if (history && history.length > 0) {
        const chartLabels = history.map((price) => moment(price.date).format('YYYY-MM-DD'));
        chartLabels.sort((a, b) => moment(a, 'YYYY-MM-DD').toDate() - moment(b, 'YYYY-MM-DD').toDate());
        const chartData = history.map((price) => price.price.$numberDecimal);
        const store = history.find((el) => {
          return stores[el.store];
        });
        //console.log(store);
        newChartDataConfig.labels = chartLabels;
        newChartDataConfig.datasets.push({
          label: `Цена`,
          data: chartData,
          borderColor: getRandomColor(),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y',
          fill: true
        });
      }
    });
    //console.log(newChartDataConfig.datasets);

    setChartDataConfig(newChartDataConfig);
  };
  

  const handleClearStore = () => {
    setStore(null);
    setNewStoreName('');
    setisStoreSelected(false)
  };
  
  const handleStoreChange = (selected) => {
    console.log(selected)
    if (selected.length > 0) {
      setStore(selected[0]);
      setSelectedStore(selected[0]);
      setNewStoreName(selected[0].name);
      setisStoreSelected(true)
    } else {
      setisStoreSelected(false)
      setStore(null);
      setSelectedStore(null);
      setNewStoreName('');
    }
  };

  const handleChartStoreClick = (store) => {
    if (selectedStore && selectedStore.storeId === store.storeId) {
      setisStoreSelected(false); // Префключете флага за избран продукт
      setSelectedStore(null); // Нулирайте избрания продукт
    } else {
      setisStoreSelected(true); // Префключете флага за избран продукт
      setSelectedStore(store); // Запаметете новия продукт
    }
    setCheapestStores( (prevCheapestStores) => 
      prevCheapestStores.map((_store) => ({
        ..._store,
        isChartButtonActive: _store.storeId === store.storeId ? !selectedStore : false,
      }))
    );
    // console.log(store.storeId,cheapestStores);
  };

  const handleChartProductClick = (product) => {
 
      // Проверете дали текущо избрания продукт е същият като новия продукт
      if (selectedProduct && selectedProduct._id === product._id) {
        setIsProductSelected(false); // Префключете флага за избран продукт
        setSelectedProduct(null); // Нулирайте избрания продукт
      } else {
        setIsProductSelected(true); // Префключете флага за избран продукт
        setSelectedProduct(product); // Запаметете новия продукт
      }


      findProductInStores(product._id);

      setShoppingList((prevList) =>
        prevList.map((item) => ({
          ...item,
          isChartButtonActive: item._id === product._id ? !isProductSelected : false,
        }))
      );
 
  };

  const renderMap = () => {
    if (loadError) {
      return <div>Error loading Google Maps</div>;
    }

    if (!isLoaded) {
      return <div>Loading...</div>;
    }

    return ( 
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={selectedStoreLocation ? { lat: selectedStoreLocation.latitude, lng: selectedStoreLocation.longitude } : { lat: 0, lng: 0 }}
        zoom={18}
      >        {isOpen && selectedStoreLocation && (
        <InfoWindow position={{ lat: selectedStoreLocation.latitude, lng: selectedStoreLocation.longitude }} disableAutoClose={true}>
          <h3>{selectedStoreLocation.store}</h3>
        </InfoWindow>
      )}
      </GoogleMap>) 
  };
 
  return (
    <>
    
     {/* {!user && <Login />  } */}
    <section className="shadow-blue white-bg padding section-min-hight-420">
    <Modal show={showModal} content={()=>{return (<>
      <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Име на списъка"
          />
    
    </>)}} onConfirmButtonClick={handleSaveList} onCloseButtonClick={ toggleShowModal} />
    <Modal show={showModal2} content={()=>{return (<>
      Добавете 1 продукт за да отключите възможността да ползвате приложението
    </>)}} onConfirmButtonClick={ () => {  navigate('/admin'); } } onCloseButtonClick={() => toggleShowModal(showModal2)} />

      <h4 className="mt-4">Списък за пазаруване</h4>
      <div className="mb-3 flex-wrap ">
        {suggestedProducts.length > 0 && (
          <Typeahead
            placeholder='Въведете имепродукт'
            ref={typeaheadRef} 
            id="productTypeahead"
            options={suggestedProducts}
            labelKey={(option) => option.name}
            onChange={handleInputChange}
            emptyLabel="Няма намерени продукти."
            selected={inputValue ? [inputValue] : []}
          />
        )}
      </div>

      {shoppingList.length > 0 && (<>
      <div className="mb-3 d-flex flex-wrap">
      {/* disabled={!user} */}
        {/* <button className="btn" onClick={toggleShowModal} >
          <FontAwesomeIcon icon={faSave} /> Запази списъка
        </button>   */}
        {/* <button className="btn" onClick={handleFindCheapest}>
          <FontAwesomeIcon icon={faSearch} /> 
        </button> */}
      </div>

      <ul className="pajak-list mb-4">

        {shoppingList.map((product) => (
          <li
            key={product._id}
            className={` d-flex justify-content-between align-items-center`}
          >
            {product.name}
            <div className="d-flex">
              <button
                className={`btn btn-sm my-2 ${
                  product.isChartButtonActive ? 'active' : ''
                }`}
                onClick={() => handleChartProductClick(product)}
              >
                <FontAwesomeIcon icon={faLineChart} />
              </button>
              <button
                className="btn btn-sm my-2"
                onClick={() => handleRemoveProduct(product)}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mb-3 d-flex justify-content-end">
  <button className="btn btn-pajak  " onClick={toggleShowModal}>
    <FontAwesomeIcon icon={faSave} /> Запази списъка
  </button>  
</div>


      </>)}


      {/* -{chartDataConfig != null ?  "true" : "false"}+ */}

      {chartDataConfig.labels.length  > 0  && (

      <div className="mb-4">
        <div className="paragraph"> 
      Графика с история на цената за избрания продукт{ !newStoreName  ? `, събирана до момента от всички магазини.` : ` само в магазин - ${newStoreName}`}
</div>
<div>

<Typeahead
            id="storeTypeahead"
            options={stores}
            labelKey="name"
            placeholder="Всички магазини"
            selected={store ? [store] : []}
            onChange={ handleStoreChange}
            renderInput={({ inputRef, referenceElementRef, ...props }) => (
                  <div className="input-group">
                    <input
                      {...props}
                      ref={(ref) => {
                        inputRef(ref);
                        inputRef.current = ref; // Assign the ref to inputRef.current
                      }}
                      className="form-control"
                      onBlur={(e)=>{setNewStoreName(e.target.value);}} // Attach onBlur event handler
                    />
                    {store && (
                      <div className="input-group-append">
                            <button
                              type="button"
                              className="btn "
                              onClick={handleClearStore}
                            >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
          />
 
</div>
        {chartDataConfig.labels.length > 0 && <Line ref={(chart) => setChartInstance(chart)} options={{
            scales: {
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, ticks) {
                          //console.log(value, index, ticks)
                            return value + 'лв';
                        }
                    }
                }
            }
          }} data={chartDataConfig} />}
      </div>)}

      {/* {cheapestStores.length > 0 ? (
        <div>
          <h4>Най-евтини места за покупка:</h4>
          <ul className="list-group mb-4">
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
                <button
                className={`btn btn-sm  ${
                  store.isChartButtonActive ? 'active' : ''
                }`}
                onClick={() => handleChartStoreClick(store)}
              >
                <FontAwesomeIcon icon={faLineChart} />
              </button>
              <button className={`btn btn-sm `} onClick={() => handleStoreClick(store)}>
                <FontAwesomeIcon icon={faLocationArrow} /></button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Няма намерени резултати.</p>
        </div>
      )} */}
      <span>{ selectedStoreLocation ? selectedStoreLocation.latitude :''}</span>
      <div className={showMap ? '' : 'hidden'}>
      {isLoaded && renderMap()}
      </div>
    </section>
    </>

  );
}

export default Client;
