import ReactDOM from 'react-dom';

const Modal = ({ show, onConfirmButtonClick, onCloseButtonClick, content, showConfirmBtn }) => {
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
          { !showConfirmBtn || <button className="btn btn-primary ms-3" onClick={onConfirmButtonClick}>Потвърди</button>}
          <button  className=" btn-pajak" onClick={onCloseButtonClick}>Затвори</button>
        </div>
      </div>
    </div>
    , document.body
  );
};

export default Modal;
