import React, { useState, useEffect, useRef } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles.css";

function CreateList() {
  const [inputValue, setInputValue] = useState("");
  const [shoppingList, setShoppingList] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [url, setUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const typeaheadRef = useRef(null);

  useEffect(() => {
    fetch(`${url}/api/products-client`)
      .then((response) => response.json())
      .then((data) => {
        setSuggestedProducts(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const handleInputChange = (selected) => {
    const inputElement = typeaheadRef.current?.inputNode;
    inputElement.scrollIntoView({ behavior: "smooth", block: "start" });
    if (inputElement) {
      inputElement.readOnly = true;
    }

    if (selected && selected.length > 0) {
      const selectedProduct1 = selected[0];
      const isProductAlreadyAdded = shoppingList.some(
        (product) => product.name === selectedProduct1.name
      );
      if (!isProductAlreadyAdded) {
        setShoppingList((prevList) => [...prevList, selectedProduct1]);
      }
    } else {
      setInputValue("");
    }
  };
  const handleRemoveProduct = (product) => {
    setShoppingList((prevList) =>
      prevList.filter((p) => p._id !== product._id)
    );
  };

  return (
    <>
      <section className="" style={{ height: "100vh", overflowY: "auto" }}>
        <h4 className="mt-4">Списък за пазаруване</h4>

        <ul className="list-group mb-4">
          {shoppingList.map((product) => (
            <li
              key={product._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {product.name}
              <div className="d-flex">
                <button
                  className="btn btn-sm ms-2"
                  onClick={() => handleRemoveProduct(product)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Typeahead
        id="productTypeahead"
        options={suggestedProducts}
        labelKey={(option) => option.name}
        onChange={handleInputChange}
        selected={inputValue ? [inputValue] : []}
        dropup
      />
    </>
  );
}

export default CreateList;
