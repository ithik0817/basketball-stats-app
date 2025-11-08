// src/App.js
import './App.css'
import Header from './components/Header'
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import EventFeed from "./components/EventFeed";
import Players from "./components/Players";
import Substitutions from "./components/Substitutions";
import Court from './components/Court'
import { useFetchGames } from "./hooks/useFetchGames";
import { useFetchTeams } from "./hooks/useFetchTeams";
import useRosterManager from './hooks/useRosterManager';
import ScoreTable from './components/ScoreTable';
import useEventManager from './hooks/useEventManager';

function App() {
  const [flipCourt, setFlipCourt] = useState(true);
  const [logs, setLogs] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pendingBenchSubs, setPendingBenchSubs] = useState([]);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const quarters = [1, 2, 3, 4, "OT"];
  const [courtFilter, setCourtFilter] = useState({
    team: "all",
    player: "all",
    quarter: "all"
  });
  const { games, loading: gamesLoading, error: gamesError } = useFetchGames();
  const { teams, loading: teamsLoading, error: teamsError } = useFetchTeams();
  const [events, setEvents] = useState([]);
  const [selectedRole, setSelectedRole] = useState("admin");

  const {
    handleAddEvent,
    handleUndoEvent,
    sortedEvents,
  } = useEventManager(
    setEvents, 
    events, 
    selectedGame?.id,
    selectedRole);

  const isOvertime = currentQuarter === "OT";

  const {
      homeRoster,
      awayRoster,
      activeHomePlayers,
      activeAwayPlayers,
      handleSub,
    } = useRosterManager(selectedGame);

  const loading = gamesLoading || teamsLoading;
  const error = gamesError || teamsError;

  // all hooks stay before any return
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { logs } }) => {
      setLogs(logs);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, logs) => {
      setLogs(logs);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((e) => {
      const matchTeam =
        !courtFilter?.team || courtFilter.team === "all" || e.teamId === courtFilter.team;
      const matchPlayer =
        !courtFilter?.player || courtFilter.player === "all" || e.playerId === courtFilter.player;
      const matchQuarter =
        !courtFilter?.quarter || courtFilter.quarter === "all" || e.quarter?.toString() === courtFilter.quarter;

      return matchTeam && matchPlayer && matchQuarter;
    });
  }, [sortedEvents, courtFilter]);

  const eventsByQuarter = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach((e) => {
      const q = e.quarter || "OT";
      if (!grouped[q]) grouped[q] = [];
      grouped[q].push(e);
    });
    return grouped;
  }, [filteredEvents]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    // Parse Supabase UTC timestamp into a JS Date
    const date = new Date(dateString);

    // Automatically formats to the user's local timezone
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short" // shows e.g. "PDT", "EST"
    });
  };

  console.log("currentQuarter", currentQuarter)
  return (
    <main className="App">
      <Header/>
      {!logs ? (
        <>
        <Auth />
        <p>Please login to start tracking stats.</p>
        </>
      ) : (
        <>
          <div className="Auth">          
            <span>
              Welcome, {logs.user.email}!
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
          
            <h2>Select Game</h2>
            <select
              className="select-option"
              value={selectedGame?.id || ""}
              onChange={(e) => {
                const game = games.find((g) => g.id === parseInt(e.target.value));
                setSelectedGame(game);
              }}
            >
              <option value="">-- Select a game --</option>
              {games.map((g) => {
                const homeTeam = teams.find((t) => t.id === g.home_team);
                const awayTeam = teams.find((t) => t.id === g.away_team);
                return (
                  <option key={g.id} value={g.id}>
                    {awayTeam?.name || "Away"} vs {homeTeam?.name || "Home"} —{" "}
                    {formatDate(g.date)}
                  </option>
                );
              })}
            </select>
            {selectedGame && (
              <>
                <div>
                  <ScoreTable 
                  awayTeamId={selectedGame.away_team}
                  homeTeamId={selectedGame.home_team}
                  awayTeamName={selectedGame.awayName}
                  homeTeamName={selectedGame.homeName}
                  events={events}
                />
                  <button className="flipCourt-control" onClick={() => setFlipCourt(prev => !prev)}>
                    {flipCourt ? "Flip Court" : "Flip to Default"}
                  </button>
                  <div className="quarter-control">
                    <h3>Quarter: {currentQuarter}</h3>
                    {quarters.map((q, i) => (
                      <button
                        //disabled={selectedRole === "homeOffense" || selectedRole === "awayOffense"}
                        key={i}
                        className={currentQuarter === q ? "active" : ""}
                        onClick={() => setCurrentQuarter(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="app-container">
                  <div className="main-content-wrapper">
                    <div className="game-layout-container">
                      <Players
                        selectedGame={selectedGame}
                        teamId={selectedGame.away_team}
                        roster = {awayRoster}
                        activePlayers = {activeAwayPlayers}
                        teamName = {selectedGame.awayName}
                        handleSub = {handleSub}
                        pendingBenchSubs={pendingBenchSubs}
                        setPendingBenchSubs={setPendingBenchSubs}
                        quarter={currentQuarter}
                      />
                      <Court 
                        selectedGame={selectedGame}
                        role="admin"
                        flipCourt={flipCourt}
                        homeTeamId={selectedGame.home_team}
                        awayTeamId={selectedGame.away_team}
                        activeHomePlayers={activeHomePlayers}
                        activeAwayPlayers={activeAwayPlayers}
                        awayTeamName={selectedGame.awayName}
                        homeTeamName={selectedGame.homeName}
                        quarter={currentQuarter}
                        events={events}
                        onAddEvent={handleAddEvent}
                        onUndoEvent={handleUndoEvent} 
                        gameId={selectedGame.id}
                        userId={logs.user.id}
                      />
                      <Players 
                        selectedGame={selectedGame}
                        teamId={selectedGame.home_team}
                        roster = {homeRoster}
                        activePlayers = {activeHomePlayers}
                        teamName = {selectedGame.homeName}
                        handleSub = {handleSub}
                        pendingBenchSubs={pendingBenchSubs}
                        setPendingBenchSubs={setPendingBenchSubs}
                        quarter={currentQuarter}
                      />
                    </div>
                  </div>
                </div>
                <div className="sub-panels-wrapper">
                  <Substitutions
                    selectedGame={selectedGame}
                    teamId={selectedGame.away_team}
                    roster = {awayRoster}
                    activePlayers = {activeAwayPlayers}
                    teamName = {selectedGame.awayName}
                    handleSub = {handleSub}
                    pendingBenchSubs={pendingBenchSubs}
                    setPendingBenchSubs={setPendingBenchSubs}
                    quarter={currentQuarter}
                  />
                  <Substitutions
                    selectedGame={selectedGame}
                    teamId={selectedGame.home_team}
                    roster = {homeRoster}
                    activePlayers = {activeHomePlayers}
                    teamName = {selectedGame.homeName}
                    handleSub = {handleSub}
                    pendingBenchSubs={pendingBenchSubs}
                    setPendingBenchSubs={setPendingBenchSubs}
                    quarter={currentQuarter}
                  />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: "#ffffff" }}></div>
                  <EventFeed 
                    events={events}
                    eventsByQuarter={eventsByQuarter}
                    awayRoster={awayRoster}
                    homeRoster={homeRoster}
                    awayTeamId={selectedGame.away_team}
                    homeTeamId={selectedGame.home_team}
                    awayTeamName={selectedGame.awayName}
                    homeTeamName={selectedGame.homeName}
                  />
              </>
            )}
        </>
      )}
    </main>
  );
}

export default App;
