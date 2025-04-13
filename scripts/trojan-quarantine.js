// window.addEventListener('scroll', function() {
//     const parallax = document.querySelector('.parallax');
//     const scrollPosition = window.scrollY;
    
//     // Adjust the background position based on scroll position
//     parallax.style.backgroundPositionY = `${scrollPosition * 0.5}px`; // Adjust the multiplier for speed
// });
document.addEventListener("DOMContentLoaded", function () {
    let sheetID = "1Hq6V4Rh8Jga4OomZsIMUYkNuKiRMwzP4ufzNsLN2JRA"; 
    let apiKey = "AIzaSyDIUxdcZMFwg_RwRc-vF5C5uEAt_xn9gu0";  
    let scoresUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Games?key=${apiKey}`;
    let standingsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Standings?key=${apiKey}`;


    async function fetchScores() {
try {
// Fetch standings data first to get team logos
let standingsResponse = await fetch(standingsUrl);
let standingsData = await standingsResponse.json();
let standingsValues = standingsData.values;
let teamLogos = {};

// Create a map of team names to logo URLs from Standings sheet
for (let i = 1; i < standingsValues.length; i++) {
    let teamName = standingsValues[i][1]; // Column B: Team Name
    let logoUrl = standingsValues[i][4] ? standingsValues[i][4] : "/images/sbc-logo.png"; // Column E: Logo URL
    teamLogos[teamName] = logoUrl;
}

// Fetch game scores
let response = await fetch(scoresUrl);
let data = await response.json();
let values = data.values;
let container = document.getElementById("gamesContainer");

container.innerHTML = ""; // Clear old scores before updating

let games = [];

for (let i = 1; i < values.length; i++) {
    let gameDate = values[i][0];  // Column A: Date
    let team1 = values[i][1];     // Column B: Team 1
    let score1 = values[i][2];    // Column C: Score 1
    let team2 = values[i][4];     // Column E: Team 2
    let score2 = values[i][5];    // Column F: Score 2
    let gameType = values[i][7] || "Regular Season"; // Column H (index 7): Game Type
    let bestPlayer = values[i][8];// Column I: Best Player
    let points = values[i][9];    // Column J: Points
    let notes = values[i][10]; // Column K (index 10): Notes
    let notesHTML = "";
    if (notes) {
        notesHTML = `<div class="game-notes" style="margin-top:4px;"><em style="color:#FE9738!important">${notes}</em></div>`;
    }

    // **Skip incomplete rows**
    // if (!gameDate || !team1 || !team2 || score1 === undefined || score2 === undefined) {
    if (!gameDate || !team1 || !team2) {
        console.warn(`Skipping incomplete row at index ${i}:`, values[i]);
        continue;
    }

    let dateObj = new Date(gameDate);
    let logo1 = teamLogos[team1] || "/images/sbc-logo.png";
    let logo2 = teamLogos[team2] || "/images/sbc-logo.png";

    let scoresHTML = "";
if (score1 !== "" && score2 !== "") {
    scoresHTML = `<div class="scores">${score1} - ${score2}</div>`;
}

let bestPlayerHTML = "";
if (bestPlayer && points) {
    bestPlayerHTML = `
        <div class="best-player">Best Player: 
            <strong style="color:#FE9738!important;">${bestPlayer} (${points} PTS)</strong>
        </div>
    `;
}

let gameCard = `
    <div class="game-card mb-5">
        <div class="teams row">
            <div class="team col-5">
                <img style="border-color:#434343" class="team-logo" src="${logo1}" alt="${team1} Logo">
                <p class="team-name">${team1}</p>
            </div>
            <span class="vs col-2">VS</span>
            <div class="team col-5">
                <img style="border-color:#434343" class="team-logo" src="${logo2}" alt="${team2} Logo">
                <p class="team-name">${team2}</p>
            </div>
        </div>
        ${scoresHTML}
        ${bestPlayerHTML}
        ${notesHTML}
    </div>
`;


    games.push({ index: i, date: dateObj, gameDate, gameType, gameCard });
}

// **Step 3: Sort all games by date (latest to oldest), with later rows appearing first for the same date**
games.sort((a, b) => {
    let dateDiff = b.date - a.date; // Sort by date (latest first)
    if (dateDiff === 0) {
        return b.index - a.index; // Later row in the sheet appears first
    }
    return dateDiff;
});

// **Step 4: Display grouped games**
let lastGameType = "";
let lastDate = "";

games.forEach(game => {
    // Add game type heading if it's a new game type
    if (game.gameType !== lastGameType) {
        container.innerHTML += `<h2 class="game-type pt-5 pb-4">${game.gameType}</h2>`;
        lastGameType = game.gameType;
        lastDate = ""; // Reset lastDate when changing game type
    }

    // Add date heading if it's a new date
    if (game.gameDate !== lastDate) {
        container.innerHTML += `<h4 class="game-date pt-5">${game.gameDate}</h4>`;
        lastDate = game.gameDate;
    }

    container.innerHTML += game.gameCard;
});

} catch (error) {
console.error("Error fetching game scores:", error);
}
}


async function fetchStandings() {
    try {
        let response = await fetch(standingsUrl);
        let data = await response.json();
        let values = data.values;
        let container = document.getElementById("standingsContainer");

        container.innerHTML = ""; // Clear old standings

        // Remove header row and sort based on win percentage
        let rows = values.slice(1).sort((a, b) => {
            let winsA = parseInt(a[2]);
            let lossesA = parseInt(a[3]);
            let winsB = parseInt(b[2]);
            let lossesB = parseInt(b[3]);

            let pctA = winsA / (winsA + lossesA || 1); // Prevent division by 0
            let pctB = winsB / (winsB + lossesB || 1);

            return pctB - pctA; // Descending order
        });

        let standingsTable = `
            <table class="standings-table">
                <tr>
                    <th>Rank</th>
                    <th width="100"></th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                </tr>
        `;

        for (let i = 0; i < rows.length; i++) {
            let [_, team, wins, losses, logo] = rows[i];
            logo = logo || "/images/sbc-logo.png";

            standingsTable += `
                <tr>
                    <td>${i + 1}</td> <!-- Recalculate rank based on sorting -->
                    <td style="min-width:50px"><img class="standings-logo" src="${logo}" alt="${team} Logo"></td>
                    <td>${team}</td>
                    <td>${wins}</td>
                    <td>${losses}</td>
                </tr>
            `;
        }

        standingsTable += `</table>`;
        container.innerHTML = standingsTable;
    } catch (error) {
        console.error("Error fetching standings:", error);
    }
}



    fetchScores(); // Fetch game scores on page load
    fetchStandings(); // Fetch standings on page load
    // setInterval(fetchScores, 30000); // Auto-refresh scores every 30 sec
    // setInterval(fetchStandings, 30000); // Auto-refresh standings every 30 sec
});