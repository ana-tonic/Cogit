import React from "react";

const EditorsList = ({ editors }) => {
  if (editors) {
    //console.log(editors);
    const editorsList = editors.map((editor) => {
      return (
        <div className="project item" key={editor.id}>
          <img
            className="ui avatar image"
            src={`data:image/png;base64,${editor.avatar.picture}`}
            alt={editor.avatar.name}
          />
          <span style={{ marginLeft: "5px" }}>{editor.username}</span>
        </div>
      );
    });
    return editorsList;
  } else return <div></div>;
};

export default EditorsList;
