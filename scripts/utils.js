const fs = require("fs");
const rimraf = require("rimraf");
const ConsoleColors = require("./console-colors");

const { FgGreen, FgBlue, FgRed, Bright, color } = ConsoleColors;

function createFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
function deleteFolder(folder) {
  if (folder && fs.existsSync(folder)) {
    console.log(
      color([Bright, FgBlue], "[scripts][utils] Deleting Folder: "),
      color([FgRed], folder)
    );
    rimraf.sync(folder);
  }
}

function deleteFile(file) {
  if (fs.existsSync(file)) {
    console.log(
      color([Bright, FgBlue], "[scripts][utils] Deleting File: "),
      color([FgRed], file)
    );
    fs.unlinkSync(file);
  }
}

function getFilesFromPath(path, extension = "*") {
  let dir = fs.readdirSync(path);
  return dir.filter((elm) => elm.match(new RegExp(`.*\.(${extension})`, "ig")));
}

function readFile(path) {
  console.log(
    color([Bright, FgBlue], "[scripts][utils][readFile] path: "),
    color([FgGreen], path)
  );
  const promise = new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, content) => {
      if (err) {
        reject(err);
      }
      resolve(content);
    });
  });
  return promise;
}

async function createFile(file, content) {
  if (fs.existsSync(file)) {
    console.log(
      color([Bright, FgRed], "[scripts][utils][createFile] Deleting File: "),
      color([FgGreen], file)
    );
    deleteFile(file);
  }
  const promise = new Promise((resolve, reject) => {
    fs.writeFile(file, content, (err) => {
      if (err) {
        console.error("[scripts][utils] Create File error:\n", err);
        reject(err);
      }
      console.log(
        color([Bright, FgBlue], "[scripts][utils] Create File: "),
        color([FgGreen], file)
      );
      resolve(file);
    });
  });
  return promise;
}

module.exports = {
  deleteFolder,
  deleteFile,
  getFilesFromPath,
  createFile,
  readFile,
  createFolder
};
