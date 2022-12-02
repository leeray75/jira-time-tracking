const { Parser } = require("json2csv");
const config = require("./config.json");
const fs = require("fs");
const path = require("path");

const utils = require("./scripts/utils");
const { createFile, getFilesFromPath, readFile, createFolder } = utils;

const repeattimes = 3;
const skipValue = 2;
const {
  "agile-meetings": meetings,
  paths,
  calendar,
  schedules,
  "pto-days": ptoDays,
} = config;
const { grooming, planning, ticket } = meetings;
const getScheduleDates = (_startDate) => {
  console.log("start date 1:", _startDate);
  const later = require("@breejs/later");
  const startDate = new Date(`${_startDate}T00:00:00.000Z`);
  console.log("start date 2:", startDate);
  const dayOfTheWeek = later.dayOfWeek.val(startDate);
  const sched = later.parse.recur(14).on(dayOfTheWeek).dayOfWeek();

  const occurrences = later
    .schedule(sched)
    .next(repeattimes * skipValue, startDate);

  const scheduleDates = occurrences.filter((occurance, index) => {
    return index % 2 === 0;
  });
  console.log("schedule Dates:", scheduleDates);
  return scheduleDates;
};
const dataPath = path.resolve(__dirname, "data");
const jsonArgs = [dataPath, "json", ...paths];
const csvArgs = [dataPath, "csv", ...paths];
const jsonPath = path.resolve.apply(null, jsonArgs);
const csvPath = path.resolve.apply(null, csvArgs);
createFolder(jsonPath);
createFolder(csvPath);
const files = getFilesFromPath(jsonPath, "json");
if (files.length < 2) {
  console.log("schedules:", schedules);
  if (files.includes(`${schedules.projects}.json`) === false) {
    const createProjects = require("./scripts/create-projects");
    const data = createProjects(
      calendar.year,
      calendar.month,
      getScheduleDates(planning["start-date"]),
      getScheduleDates(grooming["start-date"]),
      ptoDays
    );
    //console.log("Projects Data:\n", data);
    const outputFile = path.resolve(jsonPath, `${schedules["projects"]}.json`);

    const outputData = JSON.stringify(data, null, 2);
    //console.log("outputData:\n",outputData);
    createFile(outputFile, outputData);
  }
  if (files.includes(schedules["agile-meetings"]) === false) {
    const createAgileMeetings = require("./scripts/create-agile-meetings");
    const data = createAgileMeetings(
      ticket,
      calendar.year,
      calendar.month,
      getScheduleDates(planning["start-date"]),
      getScheduleDates(grooming["start-date"]),
      ptoDays
    );
    //console.log("Projects Data:\n", data);
    const outputFile = path.resolve(
      jsonPath,
      `${schedules["agile-meetings"]}.json`
    );

    const outputData = JSON.stringify(data, null, 2);
    //console.log("outputData:\n",outputData);
    createFile(outputFile, outputData);
  }
}
files.forEach((fileName, index) => {
  (async (fileName) => {
    const filePath = path.resolve(jsonPath, fileName);
    try {
      const content = await readFile(filePath);
      const data = JSON.parse(content);
      const fields = Object.keys(data[0]);
      const opts = { fields };

      const parser = new Parser(opts);
      const csv = parser.parse(data);
      const outputFile = path.resolve(
        csvPath,
        fileName.replace(".json", ".csv")
      );
      createFile(outputFile, csv);
    } catch (err) {
      console.error(err);
    }

    //console.log("[build-pages] file:",file);
    //createFile(file,template);
  })(fileName);
});
