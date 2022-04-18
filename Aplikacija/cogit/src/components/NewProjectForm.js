import axios from "axios";
import React, { useState } from "react";
import { Form, Checkbox, Popup } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import DatePckr from "./DatePicker";
import "../style/NewProjectForm.css";
import link from "./API";

function NewProjectForm({
  trigger,
  currentTeam,
  setProjects,
  fetchTeams,
  showForm,
}) {
  //#region states
  const [nameBorder, setNameBorder] = useState("rgba(34, 36, 38, 0.12)");
  const [dueDateBorder, setDueDateBorder] = useState("grey");
  const [details, setDetails] = useState({
    name: "",
    description: "",
    dueDate: "",
    tag: "none",
    template: false,
  });
  const [errorMessageText, setErrorMessageText] = useState("");
  const [errorMessageVisibility, setErrorMessageVisibility] =
    useState("hidden");
  const [submitButtonDisplay, setSubmitButtonDisplay] = useState("");
  const [loaderDisplay, setLoaderDisplay] = useState("none");
  // const [projectId, setProjectId] = useState("");
  const history = useHistory();
  //#endregion

  // useEffect(() => {
  //   setErrorMessageVisibility("hidden");
  // });

  function setDueDate(value) {
    setDetails({ ...details, dueDate: value });
  }

  const handleChange = (e, { value }) => setDetails({ ...details, tag: value });

  // kreiranje projekta u bazi
  function CreateNewProject() {
    if (details.description.length > 150) {
      setErrorMessageVisibility("visible");
      setErrorMessageText("Max length of description is 150 caracters.");
      return;
    }

    setSubmitButtonDisplay("none");
    setLoaderDisplay("");
    // console.log(details.tag);
    axios
      .post(
        link + "/projects/teams/" + currentTeam,
        {
          name: details.name,
          description: details.description,
          deadline: details.dueDate,
          tag: details.tag,
          template: details.template,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        // console.log(details.template);
        if (details.template === true) CreateTemplateLists(response.data.id);
        setSubmitButtonDisplay("");
        setLoaderDisplay("none");
        setDetails({
          name: "",
          description: "",
          dueDate: "",
          tag: "none",
          template: false,
        });
        setProjects((prevState) => [response.data, ...prevState]);
        setErrorMessageVisibility("hidden");
        showForm();
        history.push("/" + currentTeam + "/" + response.data.id);
        // setProjectId(response.data.id);
      })
      .catch(function (error) {
        console.log(error.response.data.error);
        console.log(error.response.status);
        setErrorMessageVisibility("visible");
        setErrorMessageText(error.response.data.error);
        setSubmitButtonDisplay("");
        setLoaderDisplay("none");
        //console.log(error.response.data.error);

        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }

        // ukoliko tim ne postoji
        else if (error.response.status === 404) {
          history.push("/");
          fetchTeams();
        }
        // ukoliko prijavljeni user nije team leader, smenio ga je admin
        else if (error.response.status === 403) {
          window.location.reload(false);
        }
      });
  }

  const CreateTemplateLists = async (ProjectId) => {
    try {
      const response = await axios.post(
        link + "/lists/projects/" + ProjectId,
        {
          name: "To do",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let response2;
      if (response) {
        response2 = await axios.post(
          link + "/lists/projects/" + ProjectId,
          {
            name: "Doing",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (response2) {
        const response3 = await axios.post(
          link + "/lists/projects/" + ProjectId,
          {
            name: "Done",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    } catch (error) {
      console.log(error.response.data.error);

      // ukoliko korisnik nije pronadjen
      if (error.response.status === 470) {
        localStorage.removeItem("token");
        window.location.reload(false);
      } else if (error.response.status === 404) {
        //ukoliko ne postoji projekat
        window.location.reload(false);
      }
      // nije vodja tima
      if (error.response.status === 403) {
        window.location.reload(false);
      }
    }
    history.push("/" + currentTeam + "/" + ProjectId);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (details.name === "" && details.dueDate == "") {
      setNameBorder("rgba(187, 63, 63, 0.767)");
      setDueDateBorder("red");
      return;
    } else if (details.name === "") {
      setNameBorder("rgba(187, 63, 63, 0.767)");
      return;
    } else if (details.dueDate == "") {
      setDueDateBorder("red");
      return;
    }
    CreateNewProject(details);
  };

  return trigger ? (
    <form className="NewProjectForm" onSubmit={submitHandler}>
      <div className="form-inner">
        <div className="InputFields">
          <div className="LeftSide">
            <div className="form-group">
              <label htmlFor="name" style={{ marginTop: "10px" }}>
                Enter project name(required):
              </label>
              <input
                className="NewProjectForm"
                type="text"
                name="name"
                id="name"
                onChange={(e) => {
                  setDetails({ ...details, name: e.target.value });
                  setNameBorder("rgba(34, 36, 38, 0.12)");
                  setErrorMessageVisibility("hidden");
                }}
                value={details.name}
                style={{
                  borderColor: `${nameBorder}`,
                  boxShadow: `0 2px 4px 0 ${nameBorder}`,
                  borderRadius: "0.28571429rem",
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Enter project description: </label>
              <textarea
                style={{
                  borderColor: "rgba(34, 36, 38, 0.12)",
                  boxShadow: "0 2px 4px 0 rgba(34, 36, 38, 0.12)",
                  borderRadius: "0.28571429rem",
                }}
                onChange={(e) => {
                  setErrorMessageVisibility("hidden");
                  setDetails({ ...details, description: e.target.value });
                }}
                value={details.description}
                cols="30"
                rows="5"
              ></textarea>
            </div>

            <div className="form-group">
              <label style={{ marginTop: "10px" }} htmlFor="description">
                Enter due date(required):{" "}
              </label>
              <DatePckr
                dueDate={details.dueDate}
                setDueDate={setDueDate}
                dueDateBorder={dueDateBorder}
                setDueDateBorder={setDueDateBorder}
                setErrorMessageVisibility={setErrorMessageVisibility}
              />
            </div>

            <div className="form-group">
              <div style={{ margin: "10px 0px" }} className="ui checkbox">
                <input
                  id="example-id"
                  type="checkbox"
                  name="example"
                  onChange={() =>
                    setDetails({ ...details, template: !details.template })
                  }
                />
                <label htmlFor="example-id" style={{ cursor: "pointer" }}>
                  Use template for new project
                  <Popup
                    size="mini"
                    position="right center"
                    trigger={<i className="question circle outline icon"></i>}
                    content="This option will create project which consists of three lists:
					                    To do, Doing and Done."
                    style={{ height: "min-content" }}
                  />
                </label>
              </div>

              <label htmlFor="tag" style={{ marginBottom: "5px" }}>
                Add tag:
              </label>

              <Form.Field>
                <Checkbox
                  radio
                  label="Important"
                  name="checkboxRadioGroup"
                  value="important"
                  checked={details.tag === "important"}
                  onChange={handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  radio
                  label="On hold"
                  name="checkboxRadioGroup"
                  value="on hold"
                  checked={details.tag === "on hold"}
                  onChange={handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Checkbox
                  radio
                  label="None"
                  name="checkboxRadioGroup"
                  value="none"
                  checked={details.tag === "none"}
                  onChange={handleChange}
                />
              </Form.Field>
            </div>
          </div>
        </div>

        <div
          className={`ui ${errorMessageVisibility} error message`}
          style={{
            margin: "10px",
            padding: "0.5em",
            boxShadow:
              "0 2px 4px 0 rgba(221, 106, 106, 0.918), 0 2px 4px 0 rgba(221, 106, 106, 0.918)",
          }}
        >
          <div className="header"></div>
          <p>{`${errorMessageText}`}</p>
        </div>

        <input
          type="submit"
          value="Create new project"
          style={{
            display: `${submitButtonDisplay}`,
          }}
        />
        <button
          className="ui loading button"
          color="rgb(180, 180, 180)"
          style={{
            margin: "10px",
            display: `${loaderDisplay}`,
            backgroundColor: "rgb(49, 139, 212)",
          }}
        >
          Loading
        </button>
      </div>
    </form>
  ) : (
    ""
  );
}

export default NewProjectForm;
