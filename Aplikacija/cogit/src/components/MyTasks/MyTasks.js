// import React from "react";
// import MyTask from "./MyTask";
// import "./MyTasks.css";
// import SingleTask from "./SingleTask";
// import { Dropdown } from "semantic-ui-react";

// function MyTasks() {
//   return (
//     <div className="MyTasksContainer">
//       <div className="MyTasksLeft">
//         <div className="MyTasksLeftUpper">
//           <h3 className="ui header">
//             <i className="check icon"></i>
//             <div className="content">
//               My Task
//               <div className="sub header">in list ime liste</div>
//             </div>
//           </h3>

//           <Dropdown text="Sort by" style={{ margin: "10px" }}>
//             <Dropdown.Menu>
//               <Dropdown.Item>Name</Dropdown.Item>
//               <Dropdown.Item>Due date</Dropdown.Item>
//               <Dropdown.Item>Priority</Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>

//           {/* <button className="ui button">Sort by</button> */}
//         </div>

//         <div className="MyTaskLeftDown">
//           <div className="ui segment">
//             <div className="ui large list">
//               <SingleTask
//                 name="Napraviti formu"
//                 importantTag="none"
//                 dueDate="17.5.2021."
//               />
//               <SingleTask
//                 name="Napisati funkciju"
//                 importantTag=""
//                 dueDate="18.6.2021."
//               />
//               <SingleTask
//                 name="Testirati komponentu"
//                 importantTag="none"
//                 dueDate="19.6.2021."
//               />
//               <SingleTask
//                 name="Napisati dokumentaciju"
//                 importantTag=""
//                 dueDate="20.5.2021."
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="MyTasksRight">{/* <MyTask /> */}</div>
//     </div>
//   );
// }

// export default MyTasks;
