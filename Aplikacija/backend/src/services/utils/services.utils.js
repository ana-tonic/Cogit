const lodash = require('lodash');
const schedule = require('node-schedule');
const timeValues = require('../../constants/time_values');
const { SOCKET_EVENTS, MODEL_PROPERTIES } = require('../../constants');

const { User } = require('../../db/models');

async function duplicateHandler(model, parentPropertyPath, parentId, child) {
	const isDuplicate = await model.findOne({
		[parentPropertyPath]: parentId,
		...child,
	});
	if (isDuplicate) {
		throw new Error('There is already the same instance');
	}
}
function destructureArray(arrayToDestructure, arrayofProperties) {
	const arr = [];

	arrayToDestructure.forEach((obj) => {
		arr.push(destructureObject(obj, arrayofProperties));
	});

	return arr;
}
function destructureObject(objectToDestructure, arrayofProperties) {
	const object = {};

	arrayofProperties.forEach((field) => {
		object[field] = objectToDestructure[field];
	});

	return object;
}

function optionsBuilder(limit, skip, sortBy, sortValue) {
	let options = {};
	if (limit) {
		options.limit = Number(limit);
	}
	if (skip) {
		options.skip = Number(skip);
	}
	if (sortBy) {
		options.sort = {
			[sortBy]: sortValue ? Number(sortValue) : 1,
		};
	}
	console.log(limit, options);
	return options;
}

function matchBuilder(query) {
	const matchObject = query;
	delete matchObject.limit;
	delete matchObject.skip;
	delete matchObject.sortBy;
	delete matchObject.sortValue;
	return {
		...matchObject,
	};
}

// function cond(params) {
// 	for (const condition of params) {
// 		if (condition.a[condition.sortBy] !== condition.b[condition.sortBy]) {
// 			if (a[sortBy] < b[sortBy]) return 1 * sortValue;
// 			else return -1 * sortValue;
// 		}
// 	}
// 	return 0;
// }

function queryHandler(allItems, query, selectFields, subSortBy, subSortValue) {
	const sortBy = query.sortBy;
	const sortValue = query.sortValue ? query.sortValue : 1;
	const skip = query.skip ? query.skip : 0;
	const offset = query.limit ? query.limit : allItems.length - skip;
	const match = matchBuilder(query);
	const matchKeys = Object.keys(match);
	let requestedItems = allItems.filter(
		(item) =>
			matchKeys.length ===
			matchKeys.filter((key) => lodash.get(item, key).toString() === match[key])
				.length
	);
	if (sortBy)
		requestedItems.sort(
			(a, b) =>
				(a[sortBy] !== b[sortBy] &&
					(a[sortBy] < b[sortBy] ? -1 * sortValue : 1 * sortValue)) ||
				(subSortBy
					? b[subSortBy] < a[subSortBy]
						? 1 * subSortValue
							? subSortValue
							: 1
						: -1 * subSortValue
						? subSortValue
						: 1
					: 0)
		);

	requestedItems = requestedItems.slice(
		Number(skip),
		Number(skip) + Number(offset)
	);
	if (selectFields) {
		requestedItems = destructureArray(requestedItems, selectFields.split(' '));
	}
	return requestedItems;
}
function getNextTimeStamp(date) {
	let time;
	const keys = Object.keys(timeValues);
	const key = keys.find((key) => timeValues[key] < date);

	if (key) {
		time = timeValues[key];
		while (date - time - timeValues[key] > 0) time += timeValues[key];
	}

	return { time, key };
}

function scheduleJobHandler(deadline, user, Socket, model, documentId) {
	if (deadline.getTime() <= Date.now()) return;
	const workingTime = deadline.getTime() - Date.now();
	const timeObject = getNextTimeStamp(workingTime);
	schedule.scheduleJob(
		new Date(Date.now() + workingTime - timeObject.time),
		notify.bind(null, timeObject, user, Socket, model, documentId)
	);
}
function notify({ time: timeLeft, key }, user, Socket, model, documentId) {
	(async () => {
		try {
			const document = await model.findById(documentId);
			if (!document) return;
			const message = document.notificationMessage(
				timeLeft / timeValues[key],
				key
			);
			console.log(message);
			const event = {
				event: {
					text: message,
					reference: document,
				},
				receivedAt: Date.now(),
			};
			user = await User.findById(user._id);
			if (user.active) {
				user.notifications.push(event);
				await user.save();
				Socket.sendEventToRoom(user.id, SOCKET_EVENTS.NEW_NOTIFICATION, {
					notificationNumber: user.notifications.filter((notif) => !notif.seen)
						.length,
				});
			}
			const timeObject = getNextTimeStamp(timeLeft);
			if (!timeObject.time) return;
			schedule.scheduleJob(
				new Date(Date.now() + timeLeft - timeObject.time),
				notify.bind(null, timeObject, user, Socket, model, documentId)
			);
		} catch (err) {
			console.log(err);
		}
	})();
}

async function checkAndUpdate(model, document, body, res) {
	const updates = Object.keys(body);
	const isValidUpdate = updates.every((update) =>
		MODEL_PROPERTIES[model].ALLOWED_KEYS.UPDATE.includes(update)
	);
	if (!isValidUpdate) {
		res.status(422);
		throw new Error('Invalid update fields.');
	}
	updates.forEach((update) => {
		document[update] = body[update];
	});
	await document.save();
}

module.exports = {
	duplicateHandler,
	optionsBuilder,
	queryHandler,
	matchBuilder,
	scheduleJobHandler,
	destructureObject,
	checkAndUpdate,
};
