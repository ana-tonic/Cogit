import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import TimeAgo from "react-timeago";
import axios from "axios";
import { UserContext } from "../../context/UserContext.js";
import link from "../API";

const Comment = ({
  //#region props
  fetchTeams,
  deleteComment,
  comment,
  teamLeaderDisplay,
  //#endregion
}) => {
  //#region states
  const source = `data:image/png;base64,${comment.creatorId.avatar.picture}`;
  const [user, setUser] = useContext(UserContext);
  const [starColor, setStarColor] = useState("");
  const [stars, IncreaseStars] = useState(comment.likes.length);
  const [checked, setChecked] = useState(false);
  const [pointerEvents, setPointerEvents] = useState("");
  const [trashDisplay, setTrashDisplay] = useState("none");
  const [trigger, setTrigger] = useState(false);
  const history = useHistory();
  const _isMounted = useRef(true);
  //console.log(stars);
  //#endregion

  useEffect(() => {
    if (user.avatar === "Placeholder") {
      axios
        .get(link + "/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          if (_isMounted.current) {
            setUser({
              id: value.data.id,
              admin: value.data.role === "admin" ? true : false,
              email: value.data.email,
              username: value.data.username,
              avatar: value.data.avatar.name,
              avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
            });

            if (comment.likes) {
              comment.likes.map((like) => {
                //console.log("Like: " + like);
                //console.log("User ID: " + value.data.id);
                if (like === value.data.id) {
                  // console.log("Unutar if");
                  setChecked(true);
                  setStarColor("yellow");
                }
              });
            }

            if (
              comment.creatorId._id === value.data.id ||
              teamLeaderDisplay === ""
            ) {
              setTrashDisplay("");
            }
          }
        })
        .catch((error) => {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
        })
        .finally((a) => {});
    }
    //console.log(checked);
    return () => {
      _isMounted.current = false;
    };
  }, [
    teamLeaderDisplay,
    setUser,
    user.avatar,
    comment.likes,
    comment.creatorId._id,
  ]);

  const UpdateRating = () => {
    setPointerEvents("none");
    if (!checked) {
      setChecked(!checked);
      IncreaseStars(stars + 1);
      setStarColor("yellow");
    } else {
      setChecked(!checked);
      IncreaseStars(stars - 1);
      setStarColor("");
    }
    // console.log(comment._id);

    axios
      .patch(
        link + "/comments/like/" + comment._id,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //console.log(response);
        // if (_isMounted.current) {
        // console.log(response.data);
        IncreaseStars(response.data.likes.length);
        setPointerEvents("");
        // }
      })
      .catch(function (error) {
        console.log(error.response.data.error);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }
        // ukoliko prijavljeni user nije team memeber
        else if (error.response.status === 403) {
          history.push("/");
          fetchTeams();
        }
      });
  };

  return (
    <div className="comment" style={{ position: "relative" }}>
      <div className="avatar">
        <img
          className="ui mini image"
          src={source}
          alt={comment.creatorId.avatar.name}
        />
      </div>
      <div className="content">
        <div className="author">{comment.creatorId.username}</div>
        <div className="metadata">
          <TimeAgo date={new Date(comment.createdAt)} />
          <div className="rating">
            <i
              className={`star ${starColor} icon`}
              style={{
                cursor: "pointer",
                pointerEvents: `${pointerEvents}`,
              }}
              onClick={() => UpdateRating()}
            ></i>
            {stars}
          </div>
        </div>
        <div className="text">{comment.text}</div>

        {/* <div className="text">
          <textarea
            type="text"
            onChange={(e) => {}}
            value={comment.text}
            style={{
              width: "250px",
              minHeight: "50px",
              height: "auto",
              border: "2px solid rgba(63,63,63,1)",
            }}
          />
        </div> */}
      </div>

      <div>
        {/* <i
          className="pencil alternate icon"
          style={{
            position: "absolute",
            right: "30px",
            bottom: "20px",
            cursor: "pointer",
            display: `${trashDisplay}`,
          }}
        ></i> */}
        <i
          className="trash alternate icon"
          style={{
            position: "absolute",
            right: "0",
            bottom: "20px",
            cursor: "pointer",
            display: `${trashDisplay}`,
          }}
          onClick={() => deleteComment(comment._id)}
        ></i>
      </div>
    </div>
  );
};

export default Comment;
