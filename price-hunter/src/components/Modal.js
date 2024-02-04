import ReactDOM from 'react-dom';

const Modal = ({ show, onConfirmButtonClick, onCloseButtonClick, content }) => {
  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="pajak-modal-wrapper">
      <div className="pajak-modal">
        <div className="pajak-body">
            {content()}
        </div>
        <div className="pajak-footer">
          <button className="ms-3" onClick={onConfirmButtonClick}>Потвърди</button>
          <button onClick={onCloseButtonClick}>Откажи</button>
        </div>
      </div>
    </div>
    , document.body
  );
};

export default Modal;
