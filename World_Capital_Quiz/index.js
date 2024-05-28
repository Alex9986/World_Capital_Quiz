import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Configuration for the PostgreSQL client
const db = new pg.Client({
  user: "postgres",       // Username for the PostgreSQL database
  host: "localhost",      // Host where the PostgreSQL server is running
  database: "world",      // Database name
  password: "sk1234",     // Password for the database
  port: 5432              // Port number where the PostgreSQL server is running
});

// Create a new Express application
const app = express();
const port = 3000;

// Connect to the PostgreSQL database
db.connect();

let quiz = []; // Array to hold quiz questions fetched from the database

// Query the database to fetch all rows from the 'capitals' table
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows; // Store the result rows in the quiz array
  }
  db.end(); // Close the database connection
});

let totalCorrect = 0;  // Counter to track the number of correct answers

// Middleware to parse URL-encoded bodies and serve static files from 'public' directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {}; // Object to store the current quiz question

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion(); // Select a new question
  console.log(currentQuestion); // Log the current question to the console
  res.render("index.ejs", { question: currentQuestion }); // Render the home page with the current question
});

// Route to handle POST requests when a quiz answer is submitted
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); // Extract and trim the submitted answer
  let isCorrect = false; // Flag to indicate whether the answer was correct

  // Check if the submitted answer matches the capital in the current question
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion(); // Select the next question
  // Render the index page with the new question and update whether the last answer was correct
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Function to randomly select a new question from the quiz array
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
  console.log(`New country: ${randomCountry.country}, Capital: ${randomCountry.capital}`); // Cheatsheet haha
}

// Start the server and log the URL it's listening on
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
