
const http = require("http");
const path = require("path");
const fs = require("fs");

const port = 4882;
const regpage = path.join(__dirname, "register1.html");
const loginpage = path.join(__dirname, "login1.html");
const loginFile = path.join(__dirname, "login1.json"); // File for storing user data

const app = http.createServer((req, res) => {
   if (req.url === "/reg" && req.method === "GET") {
      // Serve the registration page
      fs.readFile(regpage, "utf-8", (err, data) => {
         if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error loading registration page");
         } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
         }
      });
   } else if (req.url === "/login" && req.method === "GET") {
      // Serve the login page
      fs.readFile(loginpage, "utf-8", (err, data) => {
         if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error loading login page");
         } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
         }
      });
   } else if (req.url === "/register" && req.method === "POST") {
      // Handle registration data submission
      let body = '';
      req.on("data", (chunk) => {
         body += chunk.toString(); // Collect the data
      });

      req.on("end", () => {
         const newData = new URLSearchParams(body);
         const email = newData.get("email");
         const password = newData.get("password");

         // Validate if fields are not empty
         if (!email || !password) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            return res.end("Both email and password are required");
         }

         // Prepare the registration data to store in JSON
         const userData = { email, password };

         // Check if the login.json file exists
         fs.readFile(loginFile, "utf-8", (err, data) => {
            let users = [];
            if (!err && data) {
               users = JSON.parse(data); // If data exists, parse the JSON
            }

            // Add the new user's data to the list of users
            users.push(userData);

            // Save the updated user data back to the JSON file
            fs.writeFile(loginFile, JSON.stringify(users, null, 2), (err) => {
               if (err) {
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end("Error saving registration data");
               } else {
                  // Redirect to login page after successful registration
                  res.writeHead(302, { "Location": "/login" }); // Redirect to the login page
                  res.end();
               }
            });
         });
      });
   } else if (req.url === "/submit-login" && req.method === "POST") {
      // Handle login data submission
      let body = '';
      req.on("data", (chunk) => {
         body += chunk.toString(); // Collect the login data
      });

      req.on("end", () => {
         const newData = new URLSearchParams(body);
         const email = newData.get("email");
         const password = newData.get("password");

         if (!email || !password) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            return res.end("Both email and password are required");
         }

         // Read the login data file to validate the credentials
         fs.readFile(loginFile, "utf-8", (err, data) => {
            if (err) {
               res.writeHead(500, { "Content-Type": "text/plain" });
               return res.end("Error loading login data");
            }

            const users = JSON.parse(data);
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
               // Redirect to a welcome page if login is successful
               res.writeHead(302, { "Location": "/welcome" });
               res.end();
            } else {
               // Reload the login page if login fails
               res.writeHead(302, { "Location": "/login" });
               res.end();
            }
         });
      });
   } else if (req.url === "/welcome" && req.method === "GET") {
      // Serve a simple welcome page after successful login
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Welcome! You have logged in successfully.</h1>");
   } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404: Page not found");
   }
});

app.listen(port, () => {
   console.log(`Server started on http://localhost:${port}`);
});