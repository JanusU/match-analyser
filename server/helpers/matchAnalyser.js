export async function analyzeMatch(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean); //splits text into lines and trims extra whitespace and removes falsy lines
  
  let lastStartIndex = -1;
  lines.forEach((line, index) => {
    if (line.includes('World triggered "Match_Start"')) {
      lastStartIndex = index;
    }
  });

  if (lastStartIndex === -1) {
    throw new Error("No Match_Start found in log.");
  }
  const relevantLines = lines.slice(lastStartIndex + 1).filter(whitelisted); //remove everything before match start and only read relevant lines.
  const players = new Map();
  const sideToTeamName = {};

  let output = {
    match: {
      map: "",
      teams: [],
      score: {},
      rounds: [],
    },
    players: [],
    timeStamp: 0,
  };
  //loop to map data from relevant lines.
  for (const line of relevantLines) {

    if (line.includes("Team playing")) {
      const match = line.match(/Team playing\s+"([^"]+)"\s*:\s*([^\n]+)/);
      if (match) {
        const side = match[1].trim();
        const teamName = match[2].trim();  // Trim to remove extra whitespace

        sideToTeamName[side] = teamName;
        if (!output.match.teams.includes(teamName)) {
          output.match.teams.push(teamName);
        }

        if (!(teamName in output.match.score)) {
          output.match.score[teamName] = 0;
        }
      }
    } else if (line.includes("MatchStatus:")) {
      updateMatchStatus(output, line);
    }else if(line.includes('[FACEIT^]')){
      updateMatchScore(output,line);
    } else if (line.includes("killed") && !line.includes("killed other")) {
      updateKills(players, line, sideToTeamName);
    } else if(line.includes("assisted killing")){
      updateAssists(players,line,sideToTeamName);
    } else if(line.includes("attacked") && line.includes('damage "')){
      updateDamage(players,line,sideToTeamName);
    }
  }

  output.players = Array.from(players.values());
  return output;
}
//updates the score every round.
function updateMatchScore(output, line){
  const faceitScoreMatch = line.match(/\[FACEIT\^\]\s+(.+?)\s+\[(\d+)\s*-\s*(\d+)\]\s+(.+)/);
  if (faceitScoreMatch) {
      const team1 = faceitScoreMatch[1].trim();
      const score1 = Number(faceitScoreMatch[2]);
      const score2 = Number(faceitScoreMatch[3]);
      const team2 = faceitScoreMatch[4].trim();

      if (output.match.teams.includes(team1) && output.match.teams.includes(team2)) {
        output.match.score = {
          [team1]: score1,
          [team2]: score2
        };
      }
    }

}
//updates the timestamp, map and rounds.
function updateMatchStatus(output, line) {
  const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})/);
  const mapMatch = line.match(/on map "([^"]+)"/);
  const roundsMatch = line.match(/RoundsPlayed:\s*(-?\d+)/);
  if (dateMatch) output.timeStamp = new Date(dateMatch[1]).getTime();
  if (mapMatch) output.match.map = mapMatch[1];
  if (roundsMatch) output.match.rounds = Number(roundsMatch[1]);
}
//updates kills and also adds deaths to the victim
function updateKills(players, line, sideToTeamName) {
  const m = line.match(/"(.+)<\d+><STEAM_\d:\d:(\d+)><([^>]+)>" \[.*?\] killed "(.*?)<\d+><STEAM_\d:\d:(\d+)><([^>]+)>"/);
  if (!m) return;

  const killerName = m[1];
  const killerSteamID = m[2];
  const killerSide = m[3];
  const victimName = m[4];
  const victimSteamID = m[5];
  const victimSide = m[6];

  const killerTeam = sideToTeamName[killerSide];
  const victimTeam = sideToTeamName[victimSide];
  
  if (!players.has(killerSteamID)) {
    players.set(killerSteamID, {
      name: killerName,
      steamID: killerSteamID,
      team: killerTeam,
      kills: 1,
      assists: 0,
      deaths: 0,
      damage: 0,
    });
  } else {
    players.get(killerSteamID).kills += 1;
  }

  if (!players.has(victimSteamID)) {
    players.set(victimSteamID, {
      name: victimName,
      steamID: victimSteamID,
      team: victimTeam,
      kills: 0,
      assists: 0,
      deaths: 1,
      damage: 0,
    });
  } else {
    players.get(victimSteamID).deaths += 1;
  }
}
//updates assists,does not include flash assists
function updateAssists(players, line, sideToTeamName) {
  const m = line.match(/"(.+?)<\d+><STEAM_1:\d:(\d+)><([^>]+)>" assisted killing/);
  if (m) {
    const name = m[1].trim();
    const steamId = m[2];
    const side = m[3].trim();

    if (!players.has(steamId)) {
      players.set(steamId, {
        name,
        steamID: steamId,
        team: sideToTeamName[side],
        kills: 0,
        deaths: 0,
        assists: 1,
        damage: 0,
      });
    } else {
          players.get(steamId).assists += 1;
    }
  }
}
//updates player damage
function updateDamage(players,line,sideToTeamName){
  const m = line.match(/"(.+?)<\d+><STEAM_1:\d:(\d+)><([^>]+)>" .*?attacked .*? \(damage "(\d+)"\)/);
  if(m){
    const name = m[1].trim();
    const steamId = m[2];
    const side = m[3].trim();
    const damage = parseInt(m[4], 10);

    if (!players.has(steamId)) {
      players.set(steamId, {
        name,
        steamID: steamId,
        team: sideToTeamName[side],
        kills: 0,
        deaths: 0,
        assists: 0,
        damage: damage,
      });
    } else {
      const p = players.get(steamId);
      p.damage = (p.damage || 0) + damage;
    }
  }
}
//whitelist for relevant lines.
function whitelisted(line) {
  return (
    line.includes('World triggered "Match_Start"') ||
    line.includes("MatchStatus:") ||
    line.includes("Team playing") ||
    (line.includes("killed") && !line.includes("killed other")) ||
    line.includes("switched from team") ||
    line.includes('assisted killing') ||
    line.includes('FACEIT') ||
    line.includes('damage "')
  );
}

