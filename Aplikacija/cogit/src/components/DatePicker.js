import React from "react";
import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "../style/DatePicker.css";

const DatePckr = ({
  selectedDate,
  setDueDate,
  dueDateBorder,
  setDueDateBorder,
  maxDate,
  setErrorMessageVisibility,
}) => {
  // useEffect(() => {
  //   console.log(new Date(maxDate));
  //   console.log("Trenutno vreme: " + new Date());
  // }, []);
  const [date, setDate] = useState(selectedDate);

  return (
    <div className={`${dueDateBorder}`}>
      <DatePicker
        selected={date}
        onChange={(value) => {
          setDueDateBorder("grey");
          setDueDate(value);
          setDate(value);
          setErrorMessageVisibility("hidden");
        }}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        maxDate={new Date(maxDate)}
        isClearable
        showYearDropdown
        scrollableMonthYearDropdown
      />
    </div>
  );
};

export default DatePckr;
