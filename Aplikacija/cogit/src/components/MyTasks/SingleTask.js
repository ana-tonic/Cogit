import react, { useDebugValue, useState } from "react";
import "./SingleTask.css";

const SingleTask = ({ name, importantTag, dueDate }) => {
  const [cimportantTag, setImportantTag] = useState(true);
  const [cnmae, setName] = useState("");
  const [cdueDate, setDueDate] = useState("");

  return (
    <div className="single task ui segment">
      <div>
        {name}
        <i
          style={{ display: `${importantTag}` }}
          className="exclamation icon"
        ></i>
      </div>
      {dueDate}
    </div>
  );
};

export default SingleTask;
