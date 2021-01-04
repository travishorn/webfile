const fs = require("fs");
const path = require("path");
const async = require("async");
const dateformat = require("date-fns/format");
const filesize = require("filesize");
const _ = require("lodash");
const supportedIcons = require("./supportedIcons.json");

module.exports = (o, cb) => {
  const addStats = (fileName, done) => {
    const filePath = path.join(o.directory, fileName);
    const pathRelative = path.relative(o.base, filePath);

    fs.stat(filePath, (err, stat) => {
      if (err) return done(err);

      const nameParts = fileName.split(".");
      const type = stat.isFile() ? "file" : "directory";
      const extension = type === "file" ? nameParts[nameParts.length - 1] : "";
      const iconSupported = supportedIcons.indexOf(extension) !== -1;
      const nameTruncated = fileName.length > o.truncateNamesAt;
      const name = nameTruncated
        ? `${fileName.slice(0, o.truncateNamesAt - 1)}…`
        : fileName;

      return done(null, {
        path: pathRelative,
        extension,
        name,
        fullName: fileName,
        nameTruncated,
        modified: dateformat(stat.mtime, "M/d/yy"),
        size: filesize(stat.size, { round: 0 }),
        type,
        iconSupported,
      });
    });
  };

  fs.readdir(o.directory, (err, dirContent) => {
    if (err) return cb(err);

    async.map(dirContent, addStats, (err, filesWithStats) => {
      if (err) return cb(err);

      const sortedFiles = _.sortBy(filesWithStats, [
        "type",
        (file) => file.fullName.toLowerCase(),
      ]);

      return cb(null, sortedFiles);
    });
  });
};
