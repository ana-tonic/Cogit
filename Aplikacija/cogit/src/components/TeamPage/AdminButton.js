import React from "react";
import { Link } from "react-router-dom";

const AdminButton = ({ admin }) => {
	return (
		<div hidden={!admin}>
			<Link
				to={`/Admin`}
				className="ui large teal button"
				style={{ height: "40px" }}
			>
				Admin page
			</Link>
		</div>
	);
};

export default AdminButton;
