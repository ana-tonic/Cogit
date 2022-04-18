// const queryParamsString = window.location.search.substr(1);
// const queryParams = queryParamsString
// 	.split('&')
// 	.reduce((accumulator, singleQueryParam) => {
// 		const [key, value] = singleQueryParam.split('=');
// 		accumulator[key] = value;
// 		return accumulator;
// 	}, {});
// console.log(queryParams.email);
// console.log(queryParams.password);

var globalVariable = false;
const URL = 'https://cogit-api.herokuapp.com/';
// const URL = 'http://localhost:3000/';
var socket;
// fetch(URL + 'users/login', {
// 	method: 'POST',
// 	headers: {
// 		'Content-Type': 'application/json',
// 	},
// 	body: JSON.stringify({
// 		id: queryParams.email,
// 		password: queryParams.password,
// 	}),
// })
// 	.then((response) => {
// 		console.log('res', response);
// 		return response.json();
// 	})
// 	.then(({ token }) => {})
// 	.catch((e) => {
// 		console.log(e);
// 	});
var fetchedToken;
const $requestButton = document.querySelector('.request-button');
const $requestInput = document.querySelector('.request');
const $methodInput = document.querySelector('.method');
const $bodyInput = document.querySelector('.body');
const $response = document.querySelector('.response');
$requestButton.addEventListener('click', async () => {
	const route = $requestInput.value;
	const method = $methodInput.value;
	let body = $bodyInput.value;
	// let headers = {
	// 	Authorization: 'Bearer ' + fetchedToken,
	// };
	// if (route.includes('users/me/avatar') || route.includes('avatars/')) {
	// 	headers['Content-Type'] = 'image/png';
	// } else {
	// 	headers['Content-Type'] = 'application/json';
	// }

	fetch(URL + route, {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + fetchedToken,
		},
		body: body ? body : undefined,
	})
		.then(async (response) => {
			const jsonResponse = await response.json();
			if (jsonResponse.pic) return { jsonResponse, picture: true };
			return { jsonResponse, picture: false };
		})
		.then(({ jsonResponse, picture }) => {
			if (route === 'users/login' && jsonResponse.token) {
				socket = io({
					withCredentials: true,
					auth: { token: jsonResponse.token },
				});
				// socket.emit('authorize', jsonResponse.token);
				socket.on('check-connection', (id) => {
					console.log('still');
					socket.emit('keep-alive', id);
				});
				fetchedToken = jsonResponse.token;
				socket.on('connect_error', (err) => {
					console.log(err.message); // prints the message associated with the error
				});
				socket.on('user-status-changed', (payload) => {
					console.log(payload); // prints the message associated with the error
				});
				socket.on('new-private-message', ({ message }) => {
					console.log(message);
					$messageBoard.innerHTML += `<p>${message.from.username}:${message.text}</p>`;
				});
				socket.on('new-team-message', ({ message, team }) => {
					console.log(team, message);
					$messageBoard.innerHTML += `<p>${user.username}:${message.text}</p>`;
				});
				socket.on('message-history', (history) => {
					console.log('MESASGE HISDTORY');
					$messageBoard.innerHTML = '';
					history.forEach((msg) => {
						$messageBoard.innerHTML += `<p>${msg}</p>`;
					});
				});

				socket.on('contacts-updated', (contacts) => {
					contacts.forEach((contact) => console.log(contact.email));
				});
				socket.on('error', (error) => {
					console.log(error);
				});

				socket.on('new-notification', (notif) => {
					console.log(notif);
				});
			}
			console.log(jsonResponse);
			const keys = Object.keys(jsonResponse);
			if (jsonResponse['token']) fetchedToken = jsonResponse['token'];
			if (jsonResponse['error']) {
				console.log(jsonResponse);
				return;
			}
			if (picture) {
				$response.innerHTML = '';
				var imageElem = document.createElement('img');

				imageElem.src = 'data:image/png;base64,' + jsonResponse.pic;
				$response.appendChild(imageElem);
			} else {
				$response.innerHTML = '';
				keys.forEach((key) => {
					$response.innerHTML += key + ': ' + jsonResponse[key] + '<br/>';
				});
			}
		})
		.catch((error) => {
			console.log(error);
		});
});

const $messageBoard = document.querySelector('#messages');

const $button = document.querySelector('.msg-button');
const $input = document.querySelector('.msg-input');
const $user = document.querySelector('.user-input');
const $team = document.querySelector('.team-input');
const $teamMessage = document.querySelector('.team-msg-input');
const $session = document.querySelector('.session-input');
const $sessionMessage = document.querySelector('.session-msg-input');

$button.addEventListener('click', () => {
	const receiverId = $user.value;
	const teamId = $team.value;
	const sessionId = $session.value;
	if (receiverId) {
		fetch(`${URL}users/${receiverId}/me/messages`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${fetchedToken}`,
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				$messageBoard.innerHTML = '';
				data.forEach(({ text, from }) => {
					$messageBoard.innerHTML += `<p>${from}:${text}</p>`;
				});
			});

		socket.emit('newMessageToUser', receiverId, $input.value);
	} else if (teamId) {
		console.log('pre-if(teamId)');
		if (teamId) {
			console.log('pre-emit');
			socket.emit('newMessageToTeam', teamId, $teamMessage.value, (res) => {
				console.log(res);
			});
		}
	} else if (sessionId) {
		console.log('pre-if(sessionId)');
		console.log('pre-emit');
		socket.emit(
			'newMessageToSession',
			sessionId,
			$sessionMessage.value,
			(res) => {
				console.log(res);
			}
		);
	}
});
