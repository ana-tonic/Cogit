import React from "react";
import { Button, Icon, Modal } from "semantic-ui-react";

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

const ModalProjectComponent = (props) => {
  const [state, dispatch] = React.useReducer(exampleReducer, { open: false });

  function Confirm() {
    //props.setActiveDeleteLoader("active");
    props.confirmFunction();
    dispatch({ type: "close" });
  }

  return (
    <>
      <button
        className="ui button"
        onClick={() => dispatch({ type: "open" })}
        style={{
          margin: "5px",
          backgroundColor: " rgba(107, 185, 248, 0.801)",
        }}
      >
        <i className={props.iconClass}></i>
        {props.buttonText}
      </button>

      <Modal
        size={"mini"}
        open={state.open}
        onClose={() => dispatch({ type: "close" })}
      >
        <Modal.Header>{props.modalHeader}</Modal.Header>
        <Modal.Content>
          <p>{props.modalText}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({ type: "close" })}>
            No
          </Button>
          <Button positive onClick={Confirm}>
            Yes
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default ModalProjectComponent;
