document.addEventListener("DOMContentLoaded", () => {
  fetchEvents(currentYear, currentMonth + 1).then(() => {
    // reset the calendarEventsList
    calendarEventsList = Array(31).fill("");
    console.log(eventsList);
    for (let i = 0; i < eventsList.events.length; i++) {
      eventDate = eventsList.events[i].date;
      eventDate = eventDate.split("-");
      eventDate = eventDate[2];
      eventDate = parseInt(eventDate);
      eventDate = eventDate - 1;
      calendarEventsList[eventDate] = eventsList.events[i].name;
    }
  });
});
