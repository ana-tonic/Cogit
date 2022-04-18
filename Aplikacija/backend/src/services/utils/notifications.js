const Socket = require('../../socket/socket');
const { SOCKET_EVENTS } = require('../../constants/socket_events');

async function newNotification(user, event) {
	try {
		event.receivedAt = Date.now();
		user.notifications.push(event);
		await user.save();
		Socket.sendEventToRoom(user._id, SOCKET_EVENTS.NEW_NOTIFICATION, {
			notificationNumber: user.notifications.filter((notif) => !notif.seen)
				.length,
		});
	} catch (err) {
		console.log(err);
	}
}

async function notifyUsers(users, event) {
	try {
		for (const user of users) {
			await newNotification(user, event);
		}
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	newNotification,
	notifyUsers,
};
