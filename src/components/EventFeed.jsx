// src/EventFeed.jsx
import React from 'react';

export default function EventFeed({ events, eventsByQuarter, awayRoster, homeRoster, awayTeamId, homeTeamId, awayTeamName, homeTeamName }) {
  console.log("homeRoster", homeRoster)
  console.log("eventsByQuarter", eventsByQuarter)
  return (
    <div style={{ marginTop: 10, fontSize: 14, color: "#ffffff" }}>
      <h3>Play-By-Play Live Feed</h3>
        {Object.entries(eventsByQuarter).map(([quarter, quarterEvents]) => (
          <div key={quarter}>
            <h4 style={{ marginTop: -5, marginBottom: -10, fontSize: 16, color: "#ffffff" }} >Quarter {quarter}</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {quarterEvents.map((e) => {
                const player =
                  homeRoster.find((p) => p.id === e.player_id) ||
                  awayRoster.find((p) => p.id === e.player_id);

                const teamName =
                  e.teamId === homeTeamId
                    ? homeTeamName
                    : e.teamId === awayTeamId
                    ? awayTeamName
                    : "Unknown";

                return (
                  <li key={e.id} className={e.made ? "bold" : ""}>
                    {e.type === "timeOut" ? (
                      <>
                        {teamName} calls a timeout.
                      </>
                    ) : (
                      <>
                        {teamName} {" "}
                        {player?.name_first || "Unknown first name"} {" "}
                        {player?.name_last || "Unknown last name"} {" "}
                        {e.type === "shot" && (
                          <>
                            {e.made ? "makes a" : "misses a"}{" "}
                            {`${Math.round(e.distFt)}-foot ${e.is3 ? "3-pointer" : "2-pointer"}`}
                            {e.made && e.assistPlayer_id && (
                              <>
                                {" "}
                                (assist by{" "}
                                <em>
                                  {homeRoster.find((p) => p.id === e.assistPlayer_id)?.name_first ||
                                    awayRoster.find((p) => p.id === e.assistPlayer_id)?.name_first ||
                                    "Unknown"}
                                </em>
                                )
                              </>
                            )}
                          </>
                        )}
                        {e.type === "freeThrow" && (
                          <>
                            {e.made
                              ? "makes a free throw for 1 point."
                              : "misses a free throw for 1 point"}
                          </>
                        )}
                        {e.type === "offRebound" && "grabs an offensive rebound"}
                        {e.type === "defRebound" && "grabs a defensive rebound"}
                        {e.type === "turnOver" && "turns the ball over"}
                        {e.foulType === "personal" && "commits a personal foul"}
                        {e.foulType === "offensive" && "commits an offensive foul"}
                        {e.foulType === "defensive" && "commits a defensive foul"}
                        {e.foulType === "technical" && "commits a technical foul"}
                        {e.type === "steal" && "comes up with a steal."}
                        {e.type === "block" && "blocks the shot."}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
        </div>
      ))}
    </div>
  );
}
