import React, { useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead'; // Import Typeahead component

const StoreTypeahead = ({ stores, onCreateStore, onStoreSelect }) => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStoreName, setNewStoreName] = useState('');

  const handleInputChange = (selected) => {
    // Handle case where user selects an existing store from the Typeahead
    if (selected.length > 0 && selected[0].customOption !== true) {
      setSelectedStore(selected[0]); // Select the existing store
      setNewStoreName(''); // Clear new store name
      onStoreSelect(selected[0]); // Pass the selected store to parent component
    } else {
      setSelectedStore(null); // No store selected
      const newStore = selected.length > 0 ? { name: selected[0].name } : null;
      setNewStoreName(newStore ? newStore.name : ''); // If custom option is entered, set it as new store name
      onStoreSelect(newStore); // Pass the new store name to the parent
    }
  };

  const handleCreateStore = () => {
    if (newStoreName) {
      const newStore = { name: newStoreName };
      onCreateStore(newStoreName); // Call the function to create a new store
      setSelectedStore(newStore);
      onStoreSelect(newStore); // Pass the new store to the parent component
      setNewStoreName(''); // Reset new store name after creation
    }
  };


  const handleClearStore = () => {
    setSelectedStore(null);
    setNewStoreName('');
  };


  return (
    <div className="store-typeahead">
      <Typeahead
        id="store-typeahead"
        labelKey="name" // Store name will be shown as the label
        options={stores} // List of existing stores to show
        placeholder="Избери магазин или добави нов"
        selected={selectedStore ? [selectedStore] : []} // Selected value (existing or new)
        allowNew // Allow new store names to be entered
        newSelectionPrefix="Добави нов: " // Prefix for custom (new) stores
        onChange={handleInputChange} // Handle selection and input
        onInputChange={(text) => setNewStoreName(text)} // Set the typed value as the new store name
        renderInput={({ inputRef, referenceElementRef, ...props }) => (
            <div className="input-group">
              <input
                {...props}
                ref={(ref) => {
                  inputRef(ref);
                  inputRef.current = ref; // Assign the ref to inputRef.current
                }}
                className="form-control"
              />
              {selectedStore && (
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn delete-store-entry"
                    onClick={handleClearStore}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              )}
            </div>
          )}
      />
      {/* Show a button to create the new store if a new name is typed */}
      {newStoreName && !selectedStore && (
        <button onClick={handleCreateStore} className="btn btn-primary mt-2">
        Добави нов магазин
        </button>
      )}
    </div>
  );
};

export default StoreTypeahead;
