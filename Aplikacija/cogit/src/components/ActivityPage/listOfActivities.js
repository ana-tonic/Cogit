import React, { useState } from "react";
import Activity from "./activity";
import "./style.css";
import { useRef, useEffect } from "react";
import axios from "axios";
import ListsLoader from "../Project/ListsLoader";
import link from "../API.js";

const ActivityList = (props) => {
  const [rendFlag, setRendFlag] = useState(true);
  const [activities, setActivities] = useState([]);
  const [numA, setNumA] = useState(0);
  const [plusFlag, setPlusFlag] = useState(false);
  const [active, setActive] = useState(true);
  const _isMounted = useRef(true);
  var activitiesList;

  async function fetchActivities() {
    try {
      const response = await axios.get(
        link +
          "/users/me/notifications?sortBy=receivedAt&sortValue=-1&limit=10&skip=" +
          numA,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (activities.length === 0) setActivities(response.data);
      else setActivities(activities.concat(response.data));
      setActive(false);
      setNumA(numA + 10);
      if (response.data.length < 10) setPlusFlag(false);
      else {
        if (!plusFlag) setPlusFlag(true);
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response);
        console.log("Fetch Activities");
      }
    }
  }

  useEffect(() => {
    fetchActivities();
    return () => {
      _isMounted.current = false;
    };
  }, []);

  if (activities != undefined) {
    activitiesList = activities.map(({ event, _id, receivedAt }) => {
      return <Activity key={_id} description={event.text} time={receivedAt} />;
    });
  }

  if (activities != undefined) {
    return (
      <div className="activityList">
        <div className="actBar">
          <div className="wrap">
            <i className="huge bell icon"></i>
            <label className="actLab">Activity</label>
          </div>
        </div>
        <ListsLoader active={active} height="300px" />
        <div className="actContainerD">
          {activitiesList}
          <div className="pagCont">
            <div className="plusIcon">
              {plusFlag === true ? (
                <i
                  className="big plus circle icon"
                  onClick={() => {
                    fetchActivities();
                  }}
                ></i>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="actContainer">
        <i className="huge bell icon"></i>
        <ListsLoader active={active} height="300px" />
        <label className="actLab">No activities</label>
      </div>
    );
  }
};
export default ActivityList;

//Popravi format prikaza datuma i vremena
