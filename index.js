const fs = require('fs/promises');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment-timezone');

moment.tz.setDefault("America/New_York"); // Set timezone to Eastern Time

(async function () {
    try {
        const jsonData = JSON.parse(await fs.readFile('data.json', 'utf-8'));

        function calculateDuration(durationMinutes) {
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            return `${hours}h ${minutes}m`;
        }

        async function createCSVFromJSON(jsonData) {
            const csvWriterInstance = csvWriter({
                path: 'worklogs.csv',
                append: false,
                header: [
                    { id: 'issue', title: 'Ticket No' },
                    { id: 'start', title: 'Start Date' },
                    { id: 'timespent', title: 'Timespent' },
                    { id: 'comment', title: 'Comment' }
                ]
            });

            const workLogs = [];

            jsonData.tickets.forEach((ticket) => {
                console.log("ticket:", ticket);
                const startDate = moment.tz(ticket.start, 'MM/DD/YYYY', 'America/New_York');
                console.log("startDate:", startDate);
                const endDate = moment.tz(ticket.end, 'MM/DD/YYYY', 'America/New_York');
                console.log("endDate:", endDate);

                for (let currentDate = startDate.clone(); currentDate <= endDate; currentDate.add(1, 'day')) {
                    if (
                        currentDate.day() >= 1 && currentDate.day() <= 5 &&
                        !jsonData["pto-days"].includes(currentDate.format('MM/DD/YYYY')) &&
                        (!ticket.excludeDays || !ticket.excludeDays.includes(currentDate.format('dddd')))  &&
                        (!ticket.excludeDates || !ticket.excludeDates.includes(currentDate.format('MM/DD/YYYY')))
                    ) {
                        const workLogDate = currentDate.clone().hour(9).minute(0).second(0);
                        //console.log("workLogs:", workLogs);
                        
                        const currentDateFormat = currentDate.format('YYYY-MM-DD');
                        console.log("currentDateFormat:", currentDateFormat);
                        const currentLogs = workLogs.filter(log => {
                            const start = moment.tz(log.start.split(" ")[0], 'America/New_York').add(1, 'day');
                            const startFormat = start.format('YYYY-MM-DD');
                            console.log("startFormat:",startFormat);
                            return startFormat === currentDateFormat;
                        });
                        console.log("currentLogs:", currentLogs);
                        const timespent = currentLogs
                            .map(log => {
                                const timespentParts = log.timespent.split(" ");
                                const hours = timespentParts[0].replace("h", "");
                                const minutes = timespentParts[1].replace("m", "");
                                const time = {
                                    hours: parseInt(hours, 10),
                                    minutes: parseInt(minutes, 10)
                                }
                                return moment.duration(time).asMinutes()
                            });
                        console.log("timespent:", timespent);
                        const totalTimespentToday = timespent
                            .reduce((sum, duration) => sum + duration, 0);
                        console.log("totalTimespentToday:", totalTimespentToday);

                        const remainingTimespentMinutes = 8 * 60 - totalTimespentToday;
                        //console.log("ticket:",ticket);
                        console.log("remainingTimespentMinutes:", remainingTimespentMinutes);
                        if(totalTimespentToday>0) {
                            console.log("ticket:",ticket);
                        }
                        const timespentMinutes = typeof ticket.timespentMinutes !== 'undefined'
                            ? ticket.timespentMinutes
                            : remainingTimespentMinutes;
                        const workLog = {
                            issue: ticket.issue,
                            start: workLogDate.format('DD-MMM-YYYY HH:mm:ss'),
                            timespent: calculateDuration(timespentMinutes),
                            comment: ticket.comment
                        }
                        if(totalTimespentToday>0) {
                            console.log("workLog:",workLog);
                        }

                        workLogs.push(workLog);
                    }
                }
            });

            await csvWriterInstance.writeRecords(workLogs);
            console.log('CSV file created successfully.');
        }

        await createCSVFromJSON(jsonData);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
