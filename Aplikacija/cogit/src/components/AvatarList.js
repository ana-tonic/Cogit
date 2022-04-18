import React from "react";

function AvatarList({ Avatars, avatarid, setDefault }) {
	const av = Avatars.map(avatar => {
		const avatarSrc = `data:image/png;base64,${avatar.picture}`;
		if (avatar._id === avatarid) {
			return (
				<div key={avatar.name} className="ui tiny image">
					<img
						className="ui bordered image"
						style={{ border: "3px solid grey" }}
						src={avatarSrc}
						alt={avatar.name}
						onClick={() => setDefault(avatar._id)}
					/>
				</div>
			);
		} else {
			return (
				<div key={avatar.name} className="ui tiny image">
					<img
						src={avatarSrc}
						alt={avatar.name}
						onClick={() => setDefault(avatar._id)}
					/>
				</div>
			);
		}
	});
	return (
		<div
			className="LowerProfileAvatarList"
			style={{
				marginTop: "10px",
				marginBottom: "10px",

				maxHeight: `${Math.max(
					document.documentElement.clientHeight - 400,
					350
				)}px`,
			}}
		>
			{av}
		</div>
	);
}

export default AvatarList;
