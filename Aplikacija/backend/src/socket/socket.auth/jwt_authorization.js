const jwt = require('jsonwebtoken');
const { User } = require('../../db/models');
const { SOCKET_EVENTS } = require('../../constants');
const jwtSocketAuth = async (socketClient, sendEventToRoom) => {
	const { _id } = jwt.verify(
		socketClient.handshake.auth.token,
		process.env.TOKEN_KEY
	);
	const user = await User.findById(_id);
	if (!user) {
		throw new Error('Not Authorized');
	}
	socketClient.user = user;
	socketClient.join(socketClient.user._id.toString());
	if (!user.active) {
		user.active = true;
		await user.save();
	}
	return;
};

module.exports = {
	jwtSocketAuth,
};
