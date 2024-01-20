import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faLineChart, faLocationArrow} from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import 'chartjs-adapter-moment';
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
  
  const [selectedProduct1, setSelectedProduct1] = useState(null);


  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });

  const [chartDataConfig, setChartDataConfig] = useState({
    labels: [],
    datasets: [],
  });


  const getStores = async () => {
		try {
			const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/stores`, { withCredentials: true });
      setStores(data);
		} catch (err) {
			console.log(err);
		}
	};


  useEffect(() => {
		getStores();
	}, []);

  
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products-client`)
      .then((response) => response.json())
      .then((data) => {
        setSuggestedProducts(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      
      // fetch(`${process.env.REACT_APP_API_URL}/api/stores`)
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
          setSelectedStoreLocation({ latitude, longitude });
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
    console.log('pajak:', selectedProduct.barcode , selectedStore.storeId );

      fetchPriceHistoryForStore(selectedProduct.barcode, selectedProduct._id, selectedStore.storeId);
    }else if(isProductSelected&&selectedProduct){
      fetchPriceHistory(selectedProduct.barcode, selectedProduct._id);
    }
  }, [isProductSelected, isStoreSelected, selectedProduct, selectedStore]);
  

  useEffect(() => {
    if (Object.keys(productPriceHistories).length > 0) {
      createChart();
    }
  }, [productPriceHistories]);

  const fetchPriceHistoryForStore = (barcode, productId, storeId) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/product/${barcode}/prices/${storeId}`)
    .then((response) => response.json())
    .then((data) => {
      setProductPriceHistories((prevHistories) => ({
        ...prevHistories,
        [productId]: data,
      }));
    })
  }

  const fetchPriceHistory = (barcode, productId) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/product/${barcode}/history`)
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
    setProductPriceHistories((prevHistories) => {
      const updatedHistories = { ...prevHistories };
      delete updatedHistories[product._id];
      return updatedHistories;
    });
  };

  const handleFindCheapest = async() => {
    if (shoppingList.length === 0) {
      return;
    }

    const selectedProduct = shoppingList[0];
    const { barcode } = selectedProduct;
 

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/cheapest`, JSON.stringify(shoppingList), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setCheapestStores(response.data);
    } catch (error) {
      console.error('Error:', error);
    }



    // fetch(`${process.env.REACT_APP_API_URL}/api/cheapest`, {
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
      //console.log('history',history);

      if (history && history.length > 0) {
        const chartLabels = history.map((price) => moment(price.date).format('YYYY-MM-DD'));
        chartLabels.sort((a, b) => moment(a, 'YYYY-MM-DD').toDate() - moment(b, 'YYYY-MM-DD').toDate());
        const chartData = history.map((price) => price.price);
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
      >
        {isOpen && selectedStoreLocation && (
          <InfoWindow position={{ lat: selectedStoreLocation.latitude, lng: selectedStoreLocation.longitude }} disableAutoClose={true}>
            <h3>{selectedStoreLocation.store}</h3>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };




  return (
    <section className="shadow-blue white-bg padding">
      <h1 className="mt-4">Списък за пазаруване</h1>
      <div className="mb-3">
        {suggestedProducts.length > 0 && (
          <Typeahead
            id="productTypeahead"
            options={suggestedProducts}
            labelKey={(option) => option.name}
            onChange={handleInputChange}
            selected={inputValue ? [inputValue] : []}
          />
        )}
      </div>
      <div className="mb-3 d-flex flex-wrap">
        <button className="btn btn-primary mb-2 w-100" onClick={handleFindCheapest}>
          <FontAwesomeIcon icon={faSearch} /> Намери най-евтино
        </button>
      </div>

      <ul className="list-group mb-4">
        {shoppingList.map((product) => (
          <li
            key={product._id}
            className={`list-group-item d-flex justify-content-between align-items-center`}
          >
            {product.name}
            <div className="d-flex">
              <button
                className={`btn btn-sm btn-default ${
                  product.isChartButtonActive ? 'active' : ''
                }`}
                onClick={() => handleChartProductClick(product)}
              >
                <FontAwesomeIcon icon={faLineChart} />
              </button>
              <button
                className="btn btn-sm btn-danger ms-2"
                onClick={() => handleRemoveProduct(product)}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {chartDataConfig !== null && (<div className="mb-4">
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

      {cheapestStores.length > 0 ? (
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
                className={`btn btn-sm btn-default ${
                  store.isChartButtonActive ? 'active' : ''
                }`}
                onClick={() => handleChartStoreClick(store)}
              >
                <FontAwesomeIcon icon={faLineChart} />
              </button>
              <button className={`btn btn-sm btn-default`} onClick={() => handleStoreClick(store)}>
                <FontAwesomeIcon icon={faLocationArrow} /></button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Няма намерени резултати.</p>
        </div>
      )}

      {isLoaded && renderMap()}
    </section>
  );
}

export default Client;
