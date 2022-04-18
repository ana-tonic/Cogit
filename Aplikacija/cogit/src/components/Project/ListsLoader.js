import React from "react";

const ListsLoader = ({ active, height }) => {
  if (active === true)
    return (
      <div className="ListsLoader" style={{ height: `${height}` }}>
        <p></p>
        <div
          className={`ui active inverted dimmer`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        >
          <div className="ui loader"></div>
        </div>
      </div>
    );
  else return "";
};

export default ListsLoader;
