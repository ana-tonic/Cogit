import React from "react";
import TimeAgo from "react-timeago";

const TeamMessages = ({ teamMessages }) => {
	if (teamMessages) {
		//console.log(teamMessages);
		const msgs = teamMessages.map((msg, index) => {
			//console.log(msg);
			if (msg.from) {
				const time = new Date(msg.createdAt);
				return (
					<div key={index} className="comment">
						<div className="avatar">
							<img
								src={"data:image/png;base64," + msg.from.avatar.picture}
								alt={msg.from.avatar.name}
							/>
						</div>
						<div className="content">
							<div className="author">{msg.from.username}</div>
							<div className="metadata">
								<TimeAgo date={time} />
							</div>
							<div className="text">{msg.text}</div>
						</div>
					</div>
				);
			} else return <div key={index}></div>;
		});

		return msgs;
	} else return <div></div>;
};

export default TeamMessages;
