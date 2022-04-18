import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers({ users }) {
	if (users.length > 0) {
		const allUsers = users.map((value, index) => {
			return (
				<div
					key={index}
					className="ui relaxed divided list"
					style={{
						border: "solid 1px black",
						borderRadius: "3px",
						padding: "3px",
						margin: "3px",
						backgroundColor: "#0000008a",
						color: "white",
					}}
				>
					<div className="">
						<div style={{ whiteSpace: "pre-wrap" }} className="content">
							<div className="header">{value.username}</div>
							{JSON.stringify(value, null, "  ")}
						</div>
					</div>
				</div>
			);
		});
		return allUsers;
	} else return <div></div>;
}

export default AdminUsers;
