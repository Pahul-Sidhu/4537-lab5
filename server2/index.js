const mysql = require("mysql");
const http = require("http");
const url = require("url");
const port = 8000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lab5",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Server!");
  let query =
    "CREATE TABLE IF NOT EXISTS `patients` ( `patientID` INT (11) NOT NULL AUTO_INCREMENT , `name` VARCHAR(100) NOT NULL , `dateOfBirth` datetime  , PRIMARY KEY (`patientID`)) ENGINE = InnoDB;";
  connection.query(query, (err, result) => {
    if (err) throw err;
    console.log("Table created!");
  });
});

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && path === "/insert") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        const values = data.map(({ name, dateOfBirth }) => [name, dateOfBirth]);

        const query = "INSERT INTO patients (name, dateOfBirth) VALUES ?";

        connection.query(query, [values], (err, result) => {
          if (err) {
            console.error("Error inserting patients:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Error inserting patients" }));
          } else {
            console.log(`Inserted ${result.affectedRows} row(s)`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Patients inserted successfully" })
            );
          }
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON data" }));
      }
    });
  } else if (req.method === "GET") {
    if (path === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("Backend is running!");
    } else if (path.startsWith("/queryRead/")) {
      const text = decodeURIComponent(req.url.replace("/queryRead/", ""));
      console.log(text);
      try {
        connection.query(text, (err, result) => {
          if (err) {
            console.error("Error fetching data:", err);
            res.end(JSON.stringify({ message: "Error fetching data" }));
          } else {
            console.log(`Fetched successfully`);
            res.end(JSON.stringify({ message: result }));
          }
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON data" }));
      }
    }
  } else if (req.method === "POST" && path === "/query") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        connection.query(data.query, (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Error inserting data" }));
          } else {
            console.log(`Inserted ${result.affectedRows} row(s)`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "data inserted successfully" }));
          }
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON data" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
