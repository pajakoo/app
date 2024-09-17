import React, { useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead'; // Import Typeahead component

const StoreTypeahead = ({ stores, onCreateStore, onStoreSelect, selectedStore }) => {
  const [newStoreName, setNewStoreName] = useState('');
  const [isAddingNewStore, setIsAddingNewStore] = useState(false); // Track if a new store is being added

  const handleInputChange = (selected) => {
    // Handle case where user selects an existing store from the Typeahead
    if (selected.length > 0 && selected[0].customOption !== true) {
      onStoreSelect(selected[0]); // Select the existing store
      setNewStoreName(''); // Clear new store name
      onStoreSelect(selected[0]); // Pass the selected store to parent component
      setIsAddingNewStore(false); // Re-enable selection
    } else {
      onStoreSelect(null); // No store selected
      const newStore = selected.length > 0 ? { name: selected[0].name } : null;
      setNewStoreName(newStore ? newStore.name : ''); // If custom option is entered, set it as new store name
      setIsAddingNewStore(true); // Disable selection while adding new store
    }
  };

  const handleCreateStore = () => {
    if (newStoreName) {
      const newStore = { name: newStoreName };
      onCreateStore(newStoreName); // Call the function to create a new store
      onStoreSelect(newStore); // Pass the new store to the parent component
      setNewStoreName(''); // Reset new store name after creation
      setIsAddingNewStore(false); // Re-enable store selection
    }
  };

  const handleClearStore = () => {
    onStoreSelect(null);
    setNewStoreName('');
    setIsAddingNewStore(false); // Re-enable store selection
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
        disabled={isAddingNewStore} // Disable Typeahead when adding a new store
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
      {newStoreName && isAddingNewStore && (
        <button onClick={handleCreateStore} className="btn btn-primary mt-2">
          Добави като нов магазин
        </button>
      )}
    </div>
  );
};

export default StoreTypeahead;
