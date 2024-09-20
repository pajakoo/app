import React, { useState, useEffect, useRef, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import Modal from "../components/Modal"
import { Swiper, SwiperSlide } from 'swiper/react';
import { DNA } from 'react-loader-spinner'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faLineChart, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

import {
  APIProvider,
  Map,
  InfoWindow,
  AdvancedMarker,useAdvancedMarkerRef
} from "@vis.gl/react-google-maps";


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './styles.css';

// import required modules
import { Keyboard, Parallax, Pagination, Navigation } from 'swiper/modules';


import axios from 'axios';
function Home() {
  const [shoppingListsCarousel, setShoppingListsCarousel] = useState([]);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const [selectedStoreLocation, setSelectedStoreLocation] = useState(null);
  const [cheapestStores, setCheapestStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infowindowShown, setInfowindowShown] = useState(false);
  useEffect(() => {
    fetchShoppingListsCarousel();
  }, [])

  const toggleInfoWindow = () =>
  setInfowindowShown(previousState => !previousState);

const closeInfoWindow = () => setInfowindowShown(false);

  const toggleShowModal = () => {
    setShowModal(!showModal);
    setShowMap(!true);
  };

  const fetchShoppingListsCarousel = async () => {
    setShowPreloader(true);
    try {
      const response = await axios.get(`${url}/api/shopping-lists/random`);
      setShoppingListsCarousel(response.data);
      setShowPreloader(false);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    }
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });

  const handleStoreClick = (store) => {
    console.log(store);
    setSelectedStoreLocation(store);
    setShowMap(true);
  };
  const renderMap = () => {
    if (loadError) {
      return <div>Error loading Google Maps</div>;
    }

    if (!isLoaded) {
      return <div>Loading...</div>;
    }

    return (
    // <div className="pajak-map">
    //   <APIProvider apiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
    //   <Map controlled={true} zoom={12} center={selectedStoreLocation ? { lat: selectedStoreLocation.latitude, lng: selectedStoreLocation.longitude } : { lat: 0, lng: 0 }} mapId={'shoppyApp'}>
    //   {selectedStoreLocation && (<AdvancedMarker
    //       ref={markerRef}
    //       position={{ lat: selectedStoreLocation.latitude, lng: selectedStoreLocation.longitude }}
    //       onClick={toggleInfoWindow}
    //     />)
    //   }

    //     {infowindowShown && (
    //       <InfoWindow anchor={marker} onCloseClick={closeInfoWindow}>
    //        <h3>{selectedStoreLocation.store}</h3>
    //       </InfoWindow>
    //     )}
    //   </Map>
    // </APIProvider>
    // </div>


      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={selectedStoreLocation ? { lat: selectedStoreLocation.location.lat, lng: selectedStoreLocation.location.lng } : { lat: 0, lng: 0 }}
        zoom={18}
      >        {isOpen && selectedStoreLocation && (
        <InfoWindow position={{ lat: selectedStoreLocation.location.lat, lng: selectedStoreLocation.location.lng }} disableAutoClose={true}>
          <h3>{selectedStoreLocation.name}</h3>
        </InfoWindow>
      )}
      </GoogleMap>
      )
  };



  return (
    <>
      <section>
        {/* <h4>Идеи за покупки</h4> */}
        <DNA
          visible={showPreloader}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
          /> 
          {shoppingListsCarousel.length>0 && (
          <Swiper
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
          }}
          speed={600}
          parallax={true}
          keyboard={{
            enabled: true,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Keyboard, Parallax, Pagination, Navigation]}
          className="mySwiper"
        >
          <div
            slot="container-start"
            className="parallax-bg"
            style={{
              backgroundImage: `url(/images/shopping_activity.png)`,
            }}
            data-swiper-parallax="-23%"
          ></div>

          {shoppingListsCarousel.map((list, i) => (

            <SwiperSlide key={i}>
              <div className='sticky-note'>

                <div className='center-block' id='displayBox'>
                  <div className='col-xs-12' id='topNote'> {list.listName}</div>
                  <div className='col-xs-12' id='quoteBox'>
                    <ol>
                      {list.products.map((product, z) => (
                        <li key={z}>{product.name}</li>
                      ))}
                    </ol>
                  </div>
                  <div className='text-right' id='personBox'>
                    <button className="btn" onClick={async () => {
                      
                      try {
                        const response = await axios.post(`${url}/api/cheapest-store`, JSON.stringify(list.products), {
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                        setCheapestStores(response.data);
                        toggleShowModal()
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }} >
                      <FontAwesomeIcon icon={faLineChart} /> Провери цената
                    </button>
                    <button className="btn"  >
                      <FontAwesomeIcon icon={faShareAlt} /> Сподели
                    </button>
                  </div>
                </div>
              </div>



              {/* <div className="title" data-swiper-parallax="-300">
                {list.listName}
              </div>
              <div className="subtitle" data-swiper-parallax="-200">
                Subtitle
              </div>
              <div className="text" data-swiper-parallax="-100">
                <ol>
                  {list.products.map((product, z) => (
                    <li key={z}>{product.name}</li>
                  ))}
                </ol>
              </div> */}
            </SwiperSlide>

          ))}
        </Swiper> )}
        <Modal showConfirmBtn={false} show={showModal} content={() => {
          return (<>
            {cheapestStores.length > 0 ? (
              <div className='scrollable'>
                <h4>Най-евтини места за покупка:</h4>
                <ul className="list-group mb-5">
                  {cheapestStores.map((store, index) => (
                    <li key={index} className="list-group-item">
                      <div>
                        В <b>{store.store.name}</b> можете да го закупите за обща сума от{' '}
                        <b>
                          {new Intl.NumberFormat('bg-BG', {
                            style: 'currency',
                            currency: 'BGN',
                          }).format(store.totalPrice.toString())}
                        </b>
                      </div>
                      {/* <button className={`btn btn-sm `} onClick={() => handleStoreClick(store)}>
                        <FontAwesomeIcon icon={faLocationArrow} /></button> */}
                    </li>
                  ))}
                </ul>
                <div className={showMap ? '' : 'hidden'}>
                  {isLoaded && renderMap()}
                </div>
                {/* {renderMap()} */}

              </div>
            ) : (
              <div>
                <p className="mb-5">Няма намерени резултати.</p>
              </div>
            )}
          </>)
        }} onCloseButtonClick={toggleShowModal} />
      </section >
    </>
  );
}

export default Home;