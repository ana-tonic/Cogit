import React, { useState } from "react";
import OptionsList from "./OptionsList";
import "./OptionsList.css";

const Option = ({ option }) => {
  const [selected, setSelected] = useState("");

  const changeColor = () => {
    if (selected === "blue") {
      setSelected("");
      option.selected = false;
    } else {
      setSelected("blue");
      option.selected = true;
      //console.log(option);
    }
  };

  return (
    <div
      className={`optionsList project item ${selected}`}
      key={option.value}
      onClick={() => {
        changeColor("");
      }}
    >
      <span style={{ marginLeft: "5px" }}>{option.text}</span>
    </div>
  );
};

export default Option;
