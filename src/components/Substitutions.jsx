// src/components/Substitutions.jsx
import React, { useState, useEffect } from "react";

export default function Substitutions({ 
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
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

   const benchPlayers = roster
    .filter((player) => 
        !activePlayers.some((p) => p.id === player.id) && player.name_first !== 'TEAM'
    )
    .sort((a, b) => a.number - b.number);

  const handleBenchClick = (player) => {
    if (pendingBenchSubs.length > 0 && pendingBenchSubs[0].team_id !== teamId) {
      alert("Please finish or undo substitution from the other team first.");
      return;
    }
    if (pendingBenchSubs.some((p) => p.id === player.id)) {
      setPendingBenchSubs((prev) => prev.filter((p) => p.id !== player.id));
    } else if (pendingBenchSubs.length < 5) {
      setPendingBenchSubs((prev) => [...prev, { ...player}]);
    } else {
      alert("You can select a maximum of 5 bench players.");
    }
  };

  useEffect(() => {
    const thisTeamSelectedCount = pendingBenchSubs.filter(
      (p) => p.team_id === teamId
    ).length;
    setShowConfirmPopup(thisTeamSelectedCount === 5);
  }, [pendingBenchSubs, teamId]);

  const handleConfirmSubAll = () => {
    const thisTeamPending = pendingBenchSubs.filter((p) => p.team_id === teamId);
    
    
    handleSub(teamId, activePlayers.map((p) => p.id), thisTeamPending.map((p) => p.id));

    setPendingBenchSubs((prev) => prev.filter((p) => p.team_id !== teamId));
    setShowConfirmPopup(false);
  };

  const handleCancel = () => {
    console.log("Substitutions, handleCancel")
    setPendingBenchSubs((prev) => prev.filter((p) => p.team_id !== teamId));
    setShowConfirmPopup(false);
  };

  return (
    <>
    <div className="sub-container">
      <h3 style={{ textAlign: "center", marginTop: 0, marginBottom: 0 }}>
        {teamName} Bench
      </h3>
      <div className="timeout-controls">
        <span className="timeout-count">Timeout:  / {selectedGame.maxTimeout}</span>

      </div>
      <div className="bench-players">
        {benchPlayers.map((player) => {
          const isSelected = pendingBenchSubs.some((p) => p.id === player.id);
          return (
            <li key={player.id}>
              <button
                className={`bench-player-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleBenchClick(player)}
              >
                #{player.number} - {player.name_first} {player.name_last}
              </button>
            </li>
          );
        })}
      </div>
      
      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Substitute All Active Players?</h4>
            <p>
              You’ve selected 5 bench players. Do you want to sub out all
              active players?
            </p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleConfirmSubAll}>
                Yes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    </>
  );
}
