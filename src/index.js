const path = require("path");
const express = require("express");
const loadConfig = require("./loadConfig.js");
const getFiles = require("./getFiles.js");

loadConfig("../webfile.config.json", (err, config) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const app = express();

  app.set("view engine", "pug");
  app.set("views", "src/views");

  app.locals.title = config.title;

  app.use(
    "/_static/styles",
    express.static(path.join(__dirname, "public/styles"))
  );

  app.use("/_static/files", express.static(config.serveDirectory));

  app.get("/:dirPath*?", (req, res) => {
    const isSubdirectory = typeof req.params.dirPath !== "undefined";

    getFiles(
      {
        directory: path.join(
          config.serveDirectory,
          req.params.dirPath || "",
          req.params[0] || ""
        ),
        base: config.serveDirectory,
        truncateNamesAt: config.truncateNamesAt,
      },
      function (err, files) {
        if (err) {
          console.error(err);
          res.send(err);
        } else {
          res.render("index", { files, showParent: isSubdirectory });
        }
      }
    );
  });

  app.listen(config.port, () => {
    console.log(`Webfile server listening at http://localhost:${config.port}`);
  });
});
