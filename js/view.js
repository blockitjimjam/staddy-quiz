import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAIl0sPZojy7W1Zpa9TID3h4VrZSKOyuIg",
  authDomain: "staddy-quiz-results.firebaseapp.com",
  projectId: "staddy-quiz-results",
  storageBucket: "staddy-quiz-results.firebasestorage.app",
  messagingSenderId: "584191031209",
  appId: "1:584191031209:web:3c10c03a5df6789ea6f6b8",
  databaseURL: "https://staddy-quiz-results-default-rtdb.europe-west1.firebasedatabase.app",
  measurementId: "G-QX7FV9BYYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const roundElement = document.getElementById("round");
const statusElement = document.getElementById("status");
const teamsTableBody = document.getElementById("teamsTable").querySelector("tbody");

// Sync with Firebase
const roundRef = ref(db, "round");
const statusRef = ref(db, "status");
const teamsRef = ref(db, "teams");
const timerRef = ref(db, "timer");
let timestamp = 0;
// Update round
onValue(roundRef, (snapshot) => {
  const round = snapshot.val();
  roundElement.innerHTML = `<h1>Round ${round}</h1>`;
});

onValue(timerRef, (snapshot) => {
  timestamp = snapshot.val();
  updateTimer();
});

updateTimer();
function updateTimer() {
  clearInterval(window.timerInterval); // Clear previous interval if it exists

  window.timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((timestamp - currentTime) / 1000));

      const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
      const secs = String(remainingSeconds % 60).padStart(2, "0");
      if (remainingSeconds < 10) {
          document.getElementById("time").style.color = "red";
      } else if (remainingSeconds < 20) {
          document.getElementById("time").style.color = "orange";
      } else {
          document.getElementById("time").style.color = "white";
      }
      document.getElementById("time").innerHTML = `<h1>${mins}:${secs}</h1>`;

      if (remainingSeconds <= 0) {
          document.getElementById("time").style.color = "white";
          clearInterval(window.timerInterval); // Stop updating when time runs out
      }
  }, 1000);
}
// Update status
onValue(statusRef, (snapshot) => {
  const status = snapshot.val();
  switch (status) {
    case "Setting up...":
      statusElement.style.backgroundColor = "rgb(255, 0, 157)";
      break;
    case "Starting...":
      statusElement.style.backgroundColor = "rgb(255, 153, 0)";
      break;
    case "Playing":
      statusElement.style.backgroundColor = "rgb(15, 175, 0)";
      break;
    case "Round finished":
      statusElement.style.backgroundColor = "rgb(255, 0, 0)";
      break;
    case "Processing results...":
      statusElement.style.backgroundColor = "rgb(255, 153, 0)";
      break;
    case "Results confirmed":
      statusElement.style.backgroundColor = "rgb(0, 177, 15)";
      break;
  }
  statusElement.innerHTML = `<h1>${status}</h1>`;
});

// Update teams
onValue(ref(db, "teams"), (snapshot) => {
  const teams = snapshot.val();
  if (teams) {
    const teamList = Object.values(teams).map((team) => ({
      name: team.name,
      score: team.score || 0,
      rounds: team.rounds || {}
    }));

    // Sort teams by total score in descending order
    teamList.sort((a, b) => b.score - a.score);

    // Clear the table body
    teamsTableBody.innerHTML = "";

    // Populate the table with sorted teams
    teamList.forEach((team, index) => {
      const row = document.createElement("tr");

      // Position
      const positionCell = document.createElement("td");
      positionCell.textContent = index + 1; // 1-based index
      if (positionCell.textContent == "1") {
        positionCell.style.backgroundImage = "linear-gradient(to bottom right,rgb(173, 142, 0), #fff,rgb(129, 110, 0),rgb(173, 142, 0), #fff,rgb(129, 110, 0))";
      } else if (positionCell.textContent == "2") {
        positionCell.style.backgroundImage = "linear-gradient(to bottom right,rgb(192, 192, 192), #fff,rgb(128, 128, 128),rgb(192, 192, 192), #fff,rgb(128, 128, 128))";
      } else if (positionCell.textContent == "3") {
        positionCell.style.backgroundImage = "linear-gradient(to bottom right,rgb(205, 127, 50), #fff,rgb(139, 85, 33),rgb(205, 127, 50), #fff,rgb(139, 85, 33))";
      }
      row.appendChild(positionCell);

      // Team Name
      const nameCell = document.createElement("td");
      nameCell.textContent = team.name;
      row.appendChild(nameCell);

      // Total Score
      const scoreCell = document.createElement("td");
      scoreCell.textContent = team.score;
      row.appendChild(scoreCell);

      // Scores for Rounds 1-8
      for (let round = 1; round <= 8; round++) {
        const roundCell = document.createElement("td");
        roundCell.textContent = team.rounds[round] || 0; // Default to 0 if no score exists
        row.appendChild(roundCell);
      }

      // Add the row to the table
      teamsTableBody.appendChild(row);
    });
  } else {
    // If no teams exist, clear the table body
    teamsTableBody.innerHTML = `<tr><td colspan="11">No teams available</td></tr>`;
  }
});
