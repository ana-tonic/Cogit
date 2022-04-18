import React from "react";
import Comment from "./Comment";
import { UserProvider } from "../../context/UserContext.js";

const CommentsList = ({
  comments,
  fetchTeams,
  deleteComment,
  teamLeaderDisplay,
}) => {
  //console.log(comments);
  if (comments) {
    const commentsList = comments.map((comment) => {
      //console.log(comment);
      return (
        <UserProvider key={comment._id}>
          <Comment
            key={comment._id}
            comment={comment}
            fetchTeams={fetchTeams}
            deleteComment={deleteComment}
            teamLeaderDisplay={teamLeaderDisplay}
          />
        </UserProvider>
      );
    });
    return commentsList;
  } else return <div></div>;
};

export default CommentsList;
