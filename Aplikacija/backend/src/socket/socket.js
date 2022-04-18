var mongoose = require('mongoose');
const socketio = require('socket.io');

const { User, Team, Session, Message } = require('../db/models');
const OnlineUsersServices = require('./utils/socket.utils');
const { getSessionHandler } = require('../services/session.service');
const {
	SOCKET_EVENTS,
	PING_INTERVAL,
	RESPONSE_TIMER,
} = require('../constants');
const { jwtSocketAuth } = require('./socket.auth/');

class SocketService {
	initializeSocketServer(server) {
		this.io = socketio(server, {
			cors: {
				origin: '*',
				methods: '*',
			},
		});
		this.io
			.use(this.middleware.bind(this))
			.on('connection', this._userOnConnect.bind(this));
		setInterval(() => this.pingActiveUsers(), PING_INTERVAL);
	}
	async pingActiveUsers() {
		const activeUsers = await User.find({ active: true });
		activeUsers.forEach((user) => {
			OnlineUsersServices.pingUser(user._id);

			this.sendEventToRoom(user._id, SOCKET_EVENTS.CHECK_CONNECTION, {});
		});
		setTimeout(() => {
			OnlineUsersServices.clearNotResponsiveUsers(
				this.sendEventToRoom.bind(this)
			);
		}, RESPONSE_TIMER);
	}
	async middleware(socketClient, next) {
		try {
			await jwtSocketAuth(socketClient, this.sendEventToRoom.bind(this));

			if (!socketClient.user) {
				next(new Error('Not Authorized'));
			}
			next();
		} catch (e) {
			console.log(e.message);
			next(new Error(e.message));
		}
	}
	async _userOnConnect(socketClient) {
		console.log(
			`${socketClient.user.username}s socket connected. Connection Type: ${socketClient.conn.transport.name}`
		);

		socketClient.on('disconnect', async () => {
			console.log(`${socketClient.user.username}s socket disconnected.`);
		});

		socketClient.conn.on('upgrade', function (transport) {
			console.log(
				`${socketClient.user.username}s socket upgraded transport to: ${transport.name}`
			);
		});

		socketClient.on('logout', () => {
			socketClient.disconnect(true);
		});

		socketClient.on('keep-alive', () => {
			OnlineUsersServices.connectionAlive(socketClient.user._id);
		});

		socketClient.on('userStartedTyping', async (userId) => {
			try {
				this.sendEventToRoom(
					userId,
					SOCKET_EVENTS.USER_STARTED_TYPING,
					socketClient.user
				);
			} catch (e) {
				console.log(e);
			}
		});

		socketClient.on('userStoppedTyping', async (userId) => {
			try {
				this.sendEventToRoom(
					userId,
					SOCKET_EVENTS.USER_STOPPED_TYPING,
					socketClient.user
				);
			} catch (e) {
				console.log(e);
			}
		});

		socketClient.on('markAsSeen', async (messageId) => {
			try {
				const message = await Message.findById(messageId);
				if (!message.seenBy.includes(socketClient.user._id)) {
					message.seenBy.push(socketClient.user._id);
					await message.save();
					// notify session participant that the user saw the message. --> session.participants.forEach( user => sendEventToRoom())
				}
			} catch (err) {
				console.log(err);
			}
		});

		socketClient.on('newMessageToSession', async (sessionId, payload) => {
			sessionId = mongoose.Types.ObjectId(sessionId);
			await sendMessageToSessionHandler(
				sessionId,
				socketClient.user._id,
				payload
			);
		});

		socketClient.on('newMessageToUser', async (userId, payload) => {
			try {
				const user = await User.findById(userId);
				if (!user) {
					throw new Error('User not found.');
				}
				const sessionParticipants = [socketClient.user._id, user._id];
				const session = await getSessionHandler(sessionParticipants);

				await sendMessageToSessionHandler(
					session._id,
					socketClient.user._id,
					payload
				);
				socketClient.user = await User.findById(socketClient.user._id);
			} catch (e) {
				console.log(e);
			}
		});

		socketClient.on('newMessageToTeam', async (teamId, payload) => {
			try {
				teamId = mongoose.Types.ObjectId(teamId);
				const team = await Team.findById(teamId);
				if (!team) {
					throw new Error('Team not found.');
				}
				socketClient.user = await User.findById(socketClient.user._id);
				if (!socketClient.user) {
					throw new Error('User not found.');
				}
				if (!socketClient.user.teams.includes(teamId)) {
					throw new Error('User is not team member.');
				}
				const session = await getSessionHandler(undefined, teamId);
				await sendMessageToSessionHandler(
					session._id,
					socketClient.user._id,
					payload,
					// callback
				);
			} catch (e) {
				console.log(e);
			}
		});
	}

	sendEventToRoom(room, eventName, payload) {
		this.io.to(room.toString()).emit(eventName, payload);
	}
}
const Socket = new SocketService();

async function sendTeamMessageEvent(room, payload) {
	Socket.sendEventToRoom(room, SOCKET_EVENTS.NEW_TEAM_MESSAGE, payload);
}

async function sendPrivateMessageEvent(room, payload) {
	Socket.sendEventToRoom(room, SOCKET_EVENTS.NEW_PRIVATE_MESSAGE, payload);
}

async function sendMessageToSessionHandler(
	sessionId,
	senderId,
	message,
	callback
) {
	try {
		let session = await Session.findById(sessionId);
		const sender = await User.findById(senderId);

		if (!session) {
			throw new Error('Session not found.');
		}
		const msg = new Message({
			text: message,
			sessionId: sessionId,
			from: sender._id,
		});
		if (!msg.from) {
			throw new Error('User not found.');
		}
		msg.seenBy.push(sender._id);
		await msg.save();
		await msg.populate('from').execPopulate();
		await msg.from.populate('avatar').execPopulate();
		const payload = {
			message: msg,
			team: session.teamId,
		};
		const sendEvent = session.teamId
			? sendTeamMessageEvent
			: sendPrivateMessageEvent;
		let numOfUnreadMessages;
		let allMessages;
		let unreadMessages;
		let contact;
		for (const participant of session.participants) {
			if (!session.teamId) {
				contact = await User.findById(participant.userId);
				if (contact && !contact.contacts.includes(sender._id)) {
					contact.contacts.push(sender._id);
					await contact.save();
				}
				allMessages = await Message.find({
					sessionId: session._id,
				});
				unreadMessages = allMessages.filter(
					(message) =>
						!message.deletedBy.includes(participant.userId) &&
						!message.seenBy.includes(participant.userId)
				);
				numOfUnreadMessages = unreadMessages.length;
			}
			sendEvent(participant.userId, {
				...payload,
				numOfUnreadMessages,
			});
			// callback();
		}
	} catch (e) {
		console.log(e);
		// callback(e);
	}
}

module.exports = Socket;
