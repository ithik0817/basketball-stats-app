// src/components/Players.jsx
import React, { useState, useEffect } from "react";

export default function Players({
  selectedGame, 
  teamId,
  roster, 
  activePlayers,
  teamName, 
  handleSub, 
  onPlayerClick, 
  pendingBenchSubs, 
  setPendingBenchSubs,
  quarter,
}) {
  const [selectedActivePlayers, setSelectedActivePlayers] = useState([]);

  useEffect(() => {
    const benchPlayerIds = pendingBenchSubs.map((p) => p.id);
    const activePlayerIds = selectedActivePlayers.map((p) => p.id);

    if (
      benchPlayerIds.length > 0 &&
      benchPlayerIds.length === activePlayerIds.length
    ) {
      handleSub(teamId, activePlayerIds, benchPlayerIds);
      setPendingBenchSubs([]);
      setSelectedActivePlayers([]);
    }
  }, [pendingBenchSubs, selectedActivePlayers, handleSub, teamId, setPendingBenchSubs]);

  const handleActivePlayerClick = (activePlayer) => {
    if (pendingBenchSubs.length === 0 || pendingBenchSubs[0].team_id !== teamId) {
      return;
    }

    if (selectedActivePlayers.some((p) => p.id === activePlayer.id)) {
      setSelectedActivePlayers((prev) => prev.filter((p) => p.id !== activePlayer.id));
    } else {
      setSelectedActivePlayers((prev) => [...prev, activePlayer]);
    }
  };

  return (
    <>
    <div className="players-container">
      <h3 style={{ marginTop: 0, marginBottom: -5, textAlign: "center" }}> {teamName}</h3>
      <h4 style={{ marginTop: 0, marginBottom: 0, textAlign: "center" }}>Players (On Floor)</h4>

      <span className="teamFouls-count">
        Team Fouls:  / {selectedGame.maxFoul}
      </span>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {activePlayers.map((player) => {
          const isSelected = selectedActivePlayers.some((ap) => ap.id === player.id);
          const canClick = pendingBenchSubs.length > 0 && pendingBenchSubs[0].team_id === teamId;
          const isDisabled = !canClick;

          return (
            <li
              key={player.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                marginBottom: 10,
                padding: 0,
                justifyContent: "center",
              }}
            >
              <button 
                onClick={() => handleActivePlayerClick(player)}
                className={`active-player-btn ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                disabled={isDisabled}
                title={isDisabled? "Select bench players from this team first" : undefined
                }
              >
                #{player.number} - {player.name_first} {player.name_last}</button>
            </li>
            );
            })}
      </ul>




    </div>
    
    </>
  );
}
