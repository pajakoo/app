import { useEffect } from 'react';

const useAutoBlur = () => {
  useEffect(() => {
    const handleInputChange = (event) => {
      

      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' ) {
        event.target.blur();
      } else if( event.target.tagName === 'A' ) {
        const linkElement = event.target;
        if (linkElement) {
          // Find the closest input field relative to the 'A' element.
          const closestInput = linkElement.closest('form')?.querySelector('input, textarea, select');
      
          if (closestInput) {
            // Perform any actions you need on the closest input
            console.log('Closest input field:', closestInput);
            // Example: focus on the input field
            closestInput.blur();
          } else {
            console.log('No input field found near the clicked link');
          }
        }
      }
    };

    const handleInputClick = (event) => {
      console.log(event.target.tagName);
      if( event.target.tagName === 'A' ) {
        const linkElement = event.target;
        if (linkElement) {
          // Find the closest input field relative to the 'A' element.
          const closestInput = linkElement.closest('form')?.querySelector('input, textarea, select');
      
          if (closestInput) {
            // Perform any actions you need on the closest input
            console.log('Closest input field:', closestInput);
            // Example: focus on the input field
            closestInput.blur();
          } else {
            console.log('No input field found near the clicked link');
          }
        }
      }
    };

    document.addEventListener('change', handleInputChange);
    document.addEventListener('click', handleInputClick);

    return () => {
      document.removeEventListener('change', handleInputChange);
      document.removeEventListener('click', handleInputClick);
    };
  }, []);
};

export default useAutoBlur;
