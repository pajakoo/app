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
          <button className="btn btn-primary ms-3" onClick={onConfirmButtonClick}>Потвърди</button>
          <button  className=" btn-pajak" onClick={onCloseButtonClick}>Откажи</button>
        </div>
      </div>
    </div>
    , document.body
  );
};

export default Modal;
