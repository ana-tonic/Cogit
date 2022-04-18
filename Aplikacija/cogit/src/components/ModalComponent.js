import React from "react";
import { Button, Modal } from "semantic-ui-react";

function exampleReducer(state, action) {
  switch (action.type) {
    case "close":
      return { open: false };
    case "open":
      return { open: true };
    default:
      throw new Error("Unsupported action...");
  }
}

const ModalComponent = ({
  disable,
  modalType,
  buttonText,
  modalHeader,
  modalText,
  iconClass,
  Confirm,
  id,
}) => {
  const [state, dispatch] = React.useReducer(exampleReducer, { open: false });

  function confirmFunction() {
    Confirm(id);
    dispatch({ type: "close" });
  }

  if (modalType === "button")
    return (
      <>
        <button
          disabled={disable}
          className="ui button"
          onClick={() => dispatch({ type: "open" })}
          style={{
            marginBottom: "5px",
            backgroundColor: " #237DC3",
            color: "white",
          }}
        >
          <i className={iconClass}></i>
          {buttonText}
        </button>

        <Modal
          size={"mini"}
          open={state.open}
          onClose={() => dispatch({ type: "close" })}
        >
          <Modal.Header>{modalHeader}</Modal.Header>
          <Modal.Content>
            <p>{modalText}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={() => dispatch({ type: "close" })}>
              No
            </Button>

            <Button positive onClick={confirmFunction}>
              Yes
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  else
    return (
      <>
        <i
          className={iconClass}
          onClick={() => dispatch({ type: "open" })}
          style={{ margin: "5px", right: 0 }}
        ></i>

        {buttonText}

        <Modal
          size={"mini"}
          open={state.open}
          onClose={() => dispatch({ type: "close" })}
        >
          <Modal.Header>{modalHeader}</Modal.Header>
          <Modal.Content>
            <p>{modalText}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={() => dispatch({ type: "close" })}>
              No
            </Button>
            <Button positive onClick={() => dispatch({ type: "close" })}>
              Yes
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
};

export default ModalComponent;
