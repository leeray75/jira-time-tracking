const months = ["January","February","March","April","May","June","July",
"August","September","October","November","December"];
const abbrev_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

const getDefaultData = () => {
    return {
        "Ticket No": "",
        "Start Date": "",
        "Timespent": "30m",
        "Comment": "Stand Up"
      }
}

const getGroomingData = () => {
    return Object.assign(getDefaultData(), {
        "Timespent": "1h 30m",
        "Comment": "Sprint Grooming"
    })
}
const getPlanningData = () => {
    return Object.assign(getDefaultData(), {
        "Timespent": "1h 00m",
        "Comment": "Sprint Planning"
    })
}
function createMeetings(ticketNo="",year,month,groomingDates=[],planningDates=[], ptoDays=[]) {
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
    const json = workingDays.map( day => {
        const startDate = `${day}-${abbrev_months[month-1]}-${year} 09:00:00`;
        const groomingDay = groomingDates.find( date => {            
            return date.getDate()+1 === day && date.getMonth()+1 === month;
        })
        const planningDay = planningDates.find( date => {            
            return date.getDate()+1 === day && date.getMonth()+1 === month;
        })

        let defaultData = groomingDay == null ? getDefaultData() : getGroomingData();
        defaultData = planningDay == null ? defaultData : getPlanningData();
        const data = Object.assign({},defaultData,{
            "Start Date": startDate,
            "Ticket No": ticketNo
        })
        return data;
    })
    return json;
}

module.exports = createMeetings