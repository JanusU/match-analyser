import React, { useEffect, useState } from "react";

const MatchInspector = ({matches}) => {
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [matchStats, setMatchStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);


  // Fetch details of selected match
  useEffect(() => {
    if (!selectedMatchId) {
      setMatchStats(null);
      return;
    }
    setLoadingStats(true);
    fetch(`http://localhost:5000/api/matches/${selectedMatchId}`)
      .then((res) => res.json())
      .then((data) => {
        setMatchStats(data);
        setLoadingStats(false);
      })
      .catch(() => {
        setMatchStats(null);
        setLoadingStats(false);
      });
  }, [selectedMatchId]);

  if (!matches) return <p>Loading matches...</p>;
  return (
    <div className="max-w-4xl mx-auto p-4 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Blæst.tv CSGO Match Explorer</h2>

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 mb-6">
          {matches.map((id) => {
            const [matchName, timestamp] = id.split("-");
            const date = new Date(Number(timestamp));

            return (
              <li key={id}>
                <button
                  onClick={() => setSelectedMatchId(id)}
                  className={`w-full px-3 py-2 border rounded button ${
                    id === selectedMatchId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {`${matchName} - ${date.toLocaleDateString()}`}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedMatchId && (
        <div>
          <button
            onClick={() => setSelectedMatchId(null)}
            className="mb-4 hover:underline"
          >
            &larr; Back to matches
          </button>

          {loadingStats ? (
            <p>Loading match stats...</p>
          ) : matchStats ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1">
                  {matchStats.match.teams[0]} vs {matchStats.match.teams[1]}
                </h3>
                <p className="">
                  Map: <strong>{matchStats.match.map}</strong> &middot; Rounds Played:{" "}
                  {matchStats.match.rounds}
                </p>
                <p className="text-lg mt-1">
                  <strong>{matchStats.match.teams[0]}:</strong>{" "}
                  {matchStats.match.score[matchStats.match.teams[0]] ?? "-"} &nbsp;|&nbsp;
                  <strong>{matchStats.match.teams[1]}:</strong>{" "}
                  {matchStats.match.score[matchStats.match.teams[1]] ?? "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[0, 1].map((i) => {
                  const teamName = matchStats.match.teams[i];
                  const teamPlayers = matchStats.players.filter(
                    (p) => p.team === teamName
                  );

                  return (
                    <div key={teamName} className="mb-6">
                      <h4 className="text-xl font-bold mb-3 border-b border-gray-600 pb-1 text-yellow-400">
                        {teamName}
                      </h4>
                      <table className="w-full text-sm text-gray-300">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left px-3 py-2 font-semibold">Player</th>
                            <th className="text-center px-3 py-2 font-semibold">Kills</th>
                            <th className="text-center px-3 py-2 font-semibold">Deaths</th>
                            <th className="text-center px-3 py-2 font-semibold">K/D</th>
                            <th className="text-center px-3 py-2 font-semibold">Damage</th>
                            <th className="text-center px-3 py-2 font-semibold">ADR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...teamPlayers].sort((a, b) => b.kills - a.kills).map((player) => (
                            <tr
                              key={player.steamID}
                              className="even:bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                            >
                              <td className="px-3 py-2">{player.name}</td>
                              <td className="text-center px-3 py-2">{player.kills}</td>
                              <td className="text-center px-3 py-2">{player.deaths}</td>
                              <td className="text-center px-3 py-2">
                                {(player.kills / player.deaths).toFixed(2)}
                              </td>
                              <td className="text-center px-3 py-2">{player.damage}</td>
                              <td className="text-center px-3 py-2">
                                {Math.round(player.damage / matchStats.match.rounds)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p>Failed to load match stats.</p>
          )}
        </div>
      )}
    </div>
  );

};

export default MatchInspector;
