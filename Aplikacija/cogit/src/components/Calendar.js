import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/sass/styles.scss";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import link from "./API";
import axios from "axios";

const locales = {
	"en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

const MyCalendar = props => {
	const [events, setEvents] = useState([
		{
			title: "All Day Event very long title",
			allDay: false,
			start: new Date("1970-06-01T22:00:00.000Z"),
			end: new Date("1970-06-01T22:00:00.000Z"),
		},
	]);
	const currTeam = useLocation().pathname.split("/")[1];

	function getEvents() {
		axios
			.get(link + "/tasks/me/all/teams/" + currTeam, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then(value => {
				let list = [];
				list = value.data.map(task => {
					return {
						title: task.name,
						allDay: false,
						start: new Date(task.deadline), //task.createdAt),
						end: new Date(task.deadline),
					};
				});
				setEvents(list);
			})
			.catch(error => {
				console.log(error);
			})
			.finally(a => {});
	}

	useEffect(() => {
		getEvents();
	}, []);

	return (
		<div>
			<Calendar
				localizer={localizer}
				startAccessor="start"
				endAccessor="end"
				events={events}
				style={{ height: 500, backgroundColor: "#ffffffa1" }}
			/>
		</div>
	);
};

export default MyCalendar;
