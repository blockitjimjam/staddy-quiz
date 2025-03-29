import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, update, push, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
const statusDropdown = document.getElementById("status");
const updateStatusButton = document.getElementById("updateStatus");
const roundInput = document.getElementById("round");
const updateRoundButton = document.getElementById("updateRound");
const teamNameInput = document.getElementById("teamName");
const addTeamButton = document.getElementById("addTeam");
const teamsTable = document.getElementById("teamsTable").querySelector("tbody");
const editTeamsTable = document.getElementById("editableTeamsTable").querySelector("tbody");

// Update Status
updateStatusButton.addEventListener("click", () => {
  const status = statusDropdown.value;
  set(ref(db, "status"), status);
});

// Update Round
updateRoundButton.addEventListener("click", () => {
  const round = roundInput.value;
  if (round >= 1 && round <= 8) {
    set(ref(db, "round"), Number(round));
  } else {
    alert("Round must be between 1 and 8.");
  }
});

// Add Team
addTeamButton.addEventListener("click", () => {
  const teamName = teamNameInput.value.trim();
  if (teamName) {
    const newTeamRef = push(ref(db, "teams"));
    set(newTeamRef, { name: teamName, score: 0, rounds: {} });
    teamNameInput.value = "";
  } else {
    alert("Team name cannot be empty.");
  }
});
let teams = {};
// Sync and Manage Teams
onValue(ref(db, "teams"), (snapshot) => {
  teams = snapshot.val();
  teamsTable.innerHTML = ""; // Clear existing rows
  editTeamsTable.innerHTML = ""; // Clear existing rows

  if (teams) {
    for (const teamId in teams) {
      const team = teams[teamId];
      const row = document.createElement("tr");

      // Team Name
      const nameCell = document.createElement("td");
      nameCell.textContent = team.name;

      // Total Score
      const scoreCell = document.createElement("td");
      scoreCell.textContent = team.score;
      row.appendChild(nameCell);
      row.appendChild(scoreCell);
      // Round Scores
      const rowforEdit = row.cloneNode(true);
      for (let round = 1; round <= 8; round++) {
        const roundCell = document.createElement("td");
        roundCell.textContent = team.rounds?.[round] || 0;
        row.appendChild(roundCell);
      }
      for (let round = 1; round <= 8; round++) {
        const roundCell = document.createElement("td");
        roundCell.textContent = team.rounds?.[round] || 0;
        roundCell.contentEditable = "true";
        rowforEdit.appendChild(roundCell);
      }
      const actionsCell = document.createElement("td");
      //const editButton = document.createElement("button");
      //editButton.textContent = "Edit Scores";
      //editButton.addEventListener("click", () => {
        // const newScores = [];
        // for (let round = 1; round <= 8; round++) {
        //   const score = prompt(`Enter score for Round ${round} (current: ${team.rounds?.[round] || 0}):`);
        //   newScores[round] = Number(score) || 0;
        // }

        // Update Firebase
      //   const updatedRounds = {};
      //   let totalScore = 0;
      //   for (let round = 1; round <= 8; round++) {
      //     updatedRounds[round] = newScores[round];
      //     totalScore += newScores[round];
      //   }
      //   update(ref(db, `teams/${teamId}`), { rounds: updatedRounds, score: totalScore });
      // });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete Team";
      deleteButton.addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete ${team.name}?`)) {
          set(ref(db, `teams/${teamId}`), null);
        }
      });

      // actionsCell.appendChild(editButton);
      editTeamsTable.appendChild(rowforEdit);
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);

      teamsTable.appendChild(row);
    }
  }
});
function updateTeamsFromTable() {
  const table = document.getElementById("editableTeamsTable");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");

  for (const row of rows) {
      const teamName = row.cells[0].textContent.trim();

      // Find the team object based on the team name
      const teamId = Object.keys(teams).find(id => teams[id].name === teamName);
      if (!teamId) continue;

      const team = teams[teamId];
      let totalScore = 0;
      const updatedRounds = {};

      // Loop through the round scores (columns 2-9)
      for (let round = 1; round <= 8; round++) {
          const cell = row.cells[round + 1]; // +1 to skip Team Name and Total Points columns
          const score = Number(cell.textContent.trim()) || 0;
          updatedRounds[round] = score;
          totalScore += score;
      }

      // Update Firebase
      update(ref(db, `teams/${teamId}`), { rounds: updatedRounds, score: totalScore });
  }
}
document.getElementById("updateScores").addEventListener("click", updateTeamsFromTable);
document.getElementById("setTimer").addEventListener("click", () => {
  const mins = Number(document.getElementById("mins").value);
  const secs = Number(document.getElementById("secs").value);
  const totalSeconds = mins * 60 + secs + 2;
  const timestamp = Date.now() + totalSeconds * 1000;

  set(ref(db, "timer"), timestamp);
});