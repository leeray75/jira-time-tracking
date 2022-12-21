const months = ["January","February","March","April","May","June","July",
"August","September","October","November","December"];
const abbrev_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

const getDefaultData = () => {
    return {
        "Ticket No": "",
        "Start Date": "",
        "Timespent": "7h 30m",
        "Comment": ""
      }
}

const getGroomingData = () => {
    return Object.assign(getDefaultData(), {
        "Timespent": "6h 30m"
    })
}
const getPlanningData = () => {
    return Object.assign(getDefaultData(), {
        "Timespent": "7h 00m"
    })
}
function createProjects(tickets=[],year,month,meetings=[],ptoDays) {
    console.log("[createProjects] meetings:",meetings);
    const days = new Date(year,month,0).getDate();
    const monthDays = [];
    for( i=1; i<=days; i++) {
        monthDays.push(i);
    }
    const weekdays = monthDays.filter( dayNum => {
        const dateString = `${months[month-1]} ${dayNum}, ${year} 00:00:00`
        const date = new Date(dateString);
        const day = date.getDay();
        return day > 0 && day < 6;
    })
    const workingDays = weekdays.filter( dayNum => {
        return ptoDays.includes(dayNum) === false;
    })
    const meetingTickets = meetings.sort( (ticketA,ticketB) => {
        return ticketA.start - ticketB.start;
    })
    const groomingDates = meetingTickets.filter( ticket => {
        return ticket.comment.toLowerCase() === "grooming";
    }).map( ticket => {
        const date = new Date(`${months[month-1]} ${ticket.start}, ${year} 00:00:00`);
        return date;
    })
    const planningDates= meetingTickets.filter( ticket => {
        return ticket.comment.toLowerCase() === "planning";
    }).map( ticket => {
        const date = new Date(`${months[month-1]} ${ticket.start}, ${year} 00:00:00`);
        return date;
    })
    const json = workingDays.map( day => {
        const startDate = `${day}-${abbrev_months[month-1]}-${year} 09:00:00`;
        console.log("\n-----------------------")
        console.log("day:",day);
        console.log("month:",month);
        console.log("-----------------------")
        const groomingDay = groomingDates.find( date => {
            
            console.log("grooming Date date:",date);
            console.log("grooming Date getDate:",date.getDate());
            console.log("grooming Date getMonth:",date.getMonth());
            
            return date.getDate() === day && date.getMonth()+1 === month;
        })
        console.log("groomingDay:",groomingDay);
        console.log("-----------------------")
        const planningDay = planningDates.find( date => {

            console.log("planning Date date:",date);
            console.log("planning Date getDate:",date.getDate());
            console.log("planning Date getMonth:",date.getMonth());
            
            return date.getDate() === day && date.getMonth()+1 === month;
        })
        console.log("planningDay:",planningDay);
        console.log("-----------------------")

        let defaultData = groomingDay == null ? getDefaultData() : getGroomingData();
        defaultData = planningDay == null ? defaultData : getPlanningData();
        const ticket = tickets.find( _ticket => {
            return _ticket.start <= day && _ticket.end >= day;
        })
        const data = Object.assign({},defaultData,{
            "Start Date": startDate,
            "Ticket No": ticket ? ticket["ticket-number"] : "",
            "Comment": ticket ? ticket.comment : ""
        })
        return ticket ? data : null;
    })
    const validTickets = json.filter( ticket => {
        return ticket != null;
    })
    return validTickets;
}

module.exports = createProjects;