// src/components/Court.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import NBA_Court from "../images/NBA_Court.png";
import FIBA_Court from "../images/FIBA_Court.png";
import NCAA_Court from "../images/NCAA_Court.png";
import HS_Court from "../images/HS_Court.png";


export default function Court({ 
  selectedGame, 
  events, 
  onAddEvent,
  onUndoEvent,
  role,
  flipCourt,
  homeTeamId,
  awayTeamId,
  activeAwayPlayers,
  activeHomePlayers,
  awayTeamName,
  homeTeamName,
  quarter,
  userId
}) {
  //console.log("flipCourt", flipCourt)
  //console.log("events", events)
  const [debug, setDebug] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [pendingShot, setPendingShot] = useState(null);
  const svgRef = useRef(null);
  const [popupStep, setPopupStep] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [popupPlayers, setPopupPlayers] = useState([]);
  
  const COURT_CONFIGS = {
    nba: {
      widthFt: selectedGame.courtWidth,
      heightFt: selectedGame.courtHeight,
      threeRadiusFt: selectedGame.courtRadius3,
      rimOffsetFt: selectedGame.courtRimOffet,
      widthFtBoxCorner3: selectedGame.courtCorner3Width,
      heightFtBoxCorner3: selectedGame.courtCorner3Height,
      widthFtBoxInsidePaint: selectedGame.courtPaintWidth,
      heightFtBoxInsidePaint: selectedGame.courtPaintHeight,
      image: NBA_Court,
      imageHeight: 532,
    },
    fiba: {
      widthFt: selectedGame.courtWidth,
      heightFt: selectedGame.courtHeight,
      threeRadiusFt: selectedGame.courtRadius3,
      rimOffsetFt: selectedGame.courtRimOffet,
      widthFtBoxCorner3: selectedGame.courtCorner3Width,
      heightFtBoxCorner3: selectedGame.courtCorner3Height,
      widthFtBoxInsidePaint: selectedGame.courtPaintWidth,
      heightFtBoxInsidePaint: selectedGame.courtPaintHeight,
      image: FIBA_Court,
      imageHeight: 537,
    },
    ncaa: {
      widthFt: selectedGame.courtWidth,
      heightFt: selectedGame.courtHeight,
      threeRadiusFt: selectedGame.courtRadius3,
      rimOffsetFt: selectedGame.courtRimOffet,
      widthFtBoxCorner3: selectedGame.courtCorner3Width,
      heightFtBoxCorner3: selectedGame.courtCorner3Height,
      widthFtBoxInsidePaint: selectedGame.courtPaintWidth,
      heightFtBoxInsidePaint: selectedGame.courtPaintHeight,
      image: NCAA_Court,
      imageHeight: 533,
    },
    highSchool: {
      widthFt: selectedGame.courtWidth,
      heightFt: selectedGame.courtHeight,
      threeRadiusFt: selectedGame.courtRadius3,
      rimOffsetFt: selectedGame.courtRimOffet,
      widthFtBoxCorner3: selectedGame.courtCorner3Width,
      heightFtBoxCorner3: selectedGame.courtCorner3Height,
      widthFtBoxInsidePaint: selectedGame.courtPaintWidth,
      heightFtBoxInsidePaint: selectedGame.courtPaintHeight,
      image: HS_Court,
      imageHeight: 596,
    },
  };

  const config = COURT_CONFIGS[selectedGame.courtCode];

  const COURT_WIDTH_FT = config.widthFt;
  const COURT_HEIGHT_FT = config.heightFt;
  const THREE_RADIUS_FT = config.threeRadiusFt;
  const RIM_OFFSET_FT = config.rimOffsetFt;
  const RIM_Y_FT = COURT_HEIGHT_FT / 2;
  const CORNER_THREE_RECT_WIDTH_FT = config.widthFtBoxCorner3;
  const CORNER_THREE_RECT_HEIGHT_FT = config.heightFtBoxCorner3;
  const INSIDE_PAINT_RECT_WIDTH_FT = config.widthFtBoxInsidePaint;
  const INSIDE_PAINT_RECT_HEIGHT_FT = config.heightFtBoxInsidePaint;
  
  const COURT_WIDTH_PX = 1000;
  const COURT_HEIGHT_PX = config.imageHeight;

  const scaleX = COURT_WIDTH_PX / COURT_WIDTH_FT;
  const scaleY = COURT_HEIGHT_PX / COURT_HEIGHT_FT;

  const TopX = 0;
  const TopY = 0;
  const BottomY = COURT_HEIGHT_FT - CORNER_THREE_RECT_HEIGHT_FT;
  const RightX = COURT_WIDTH_FT - CORNER_THREE_RECT_WIDTH_FT;
  const rectWidthPx = ftToPxX(CORNER_THREE_RECT_WIDTH_FT);
  const rectHeightPx = ftToPxY(CORNER_THREE_RECT_HEIGHT_FT);
  const BottomYPx = ftToPxY(BottomY);
  const RightXPx = ftToPxX(RightX);

  const rimLeftPx = {
    x: ftToPxX(RIM_OFFSET_FT),
    y: ftToPxY(RIM_Y_FT)
  };
  const rimRightPx = {
    x: ftToPxX(COURT_WIDTH_FT - RIM_OFFSET_FT),
    y: ftToPxY(RIM_Y_FT),
  };

  function ftToPxX(ftX) { return ftX * scaleX; }
  function ftToPxY(ftY) { return ftY * scaleY; }
  function pxToFtX(pxX) { return pxX / scaleX; }
  function pxToFtY(pxY) { return pxY / scaleY; }

  const handleCancel = useCallback(() => {
    setPendingShot(null);
    setPopupStep(null);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      handleCancel();
      return;
    }

    if (popupStep !== "player") return;

    if (/^(Digit|Numpad)[0-9]$/.test(e.code)) {
      const idx = parseInt(e.key, 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < popupPlayers.length) {
        const p = popupPlayers[idx];
        if (p) {
          setPendingShot({
            ...pendingShot,
            player_id: p.id,
            teamId: p.teamId,
          });
          setPopupStep("result");
        }
      }
    }
  }, [popupStep, popupPlayers, pendingShot, handleCancel]);  

  
useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (popupStep !== "result" || !pendingShot) return;

    const handleKeyDown = (e) => {
      if (e.key === "1") {
        // Made
        if (pendingShot.isFreeThrow) {
          finalizeShot(true);
        } else {
          setPendingShot({ ...pendingShot, made: true });
          setPopupStep("assist");
        }
      } else if (e.key === "2") {
        // Missed
        finalizeShot(false);
      } else if (e.key === "Escape") {
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popupStep, pendingShot]);


  useEffect(() => {
    if (popupStep !== "assist" || !pendingShot) return;

    const activePlayers =
      pendingShot.teamId === awayTeamId
        ? activeAwayPlayers
        : activeHomePlayers;

    const assistOptions = activePlayers.filter(
      (p) => p.id !== pendingShot.player_id
    );

    const handleKeyDown = (e) => {
      const key = e.key;

      if (/^[1-9]$/.test(key)) {
        const index = parseInt(key, 10) - 1;
        if (assistOptions[index]) {
          finalizeShot(true, assistOptions[index].id);
        }
      } else if (key === "0" || key.toLowerCase() === "n") {
        finalizeShot(true, null);
      } else if (key === "Escape") {
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popupStep, pendingShot, activeAwayPlayers, activeHomePlayers]);


  function toSVGPoint(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return null;

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const inv = ctm.inverse();
    const svgP = pt.matrixTransform(inv);

    return { x: svgP.x, y: svgP.y };
  }

  function handlePointerDown(e) {
    const svgP = toSVGPoint(e.clientX, e.clientY);
    if (!svgP) return;

    const ftX = pxToFtX(svgP.x);
    const ftY = pxToFtY(svgP.y);

    let courtSide;
    if (!flipCourt) {
      courtSide = ftX < COURT_WIDTH_FT / 2 ? "home" : "away";
    } else {
      courtSide = ftX < COURT_WIDTH_FT / 2 ? "away" : "home";
    }

    const offenseAllowed =
      (courtSide === "home" && role === "homeOffense") ||
      (courtSide === "away" && role === "awayOffense") || 
      role === "admin";

    if (!offenseAllowed ) {
      if (role === "homeDefense" || role === "awayDefense") {
        alert(`You are not allowed to track shots.`);
      }
      else{
      const teamName =
        courtSide === "home" ? homeTeamName : awayTeamName;
        alert(`You are not allowed to track shots for the ${teamName} team.`);
      }
      return;
    }

    setPendingShot({
      x: e.clientX,
      y: e.clientY,
      ftX,
      ftY,
      courtSide,
      flipCourt,
      isFreeThrow: false,
      role,
      selectedGame,
      userId,
      });
    setPopupStep("player");
  }

  function computeShot(ftX, ftY, courtSide, flipCourt) {
    const rimY = RIM_Y_FT;
    const rimX = !flipCourt
      ? courtSide === "home"
        ? RIM_OFFSET_FT
        : COURT_WIDTH_FT - RIM_OFFSET_FT
      : courtSide === "home"
        ? COURT_WIDTH_FT - RIM_OFFSET_FT
        : RIM_OFFSET_FT;

    const dx = ftX - rimX;
    const dy = ftY - rimY;
    const distFt = Math.hypot(dx, dy);

    // === Paint zones ===
    const paintTopY = (COURT_HEIGHT_FT / 2) - (INSIDE_PAINT_RECT_HEIGHT_FT / 2);
    const paintBottomY = paintTopY + INSIDE_PAINT_RECT_HEIGHT_FT;
    const leftPaintXStart = TopX;
    const leftPaintXEnd = TopX + INSIDE_PAINT_RECT_WIDTH_FT;
    const rightPaintXStart = COURT_WIDTH_FT - INSIDE_PAINT_RECT_WIDTH_FT;
    const rightPaintXEnd = COURT_WIDTH_FT;

    const inLeftPaint =
      ftX >= leftPaintXStart &&
      ftX <= leftPaintXEnd &&
      ftY >= paintTopY &&
      ftY <= paintBottomY;

    const inRightPaint =
      ftX >= rightPaintXStart &&
      ftX <= rightPaintXEnd &&
      ftY >= paintTopY &&
      ftY <= paintBottomY;

    const inPaint = inLeftPaint || inRightPaint;

    // === Corner 3 zones (your existing logic) ===
    const inLeftTopCorner =
      ftX >= TopX &&
      ftX <= (TopX + CORNER_THREE_RECT_WIDTH_FT) &&
      ftY >= TopY &&
      ftY <= (TopY + CORNER_THREE_RECT_HEIGHT_FT);
    const inLeftBottomCorner =
      ftX >= TopX &&
      ftX <= (TopX + CORNER_THREE_RECT_WIDTH_FT) &&
      ftY >= BottomY &&
      ftY <= (BottomY + CORNER_THREE_RECT_HEIGHT_FT);
    const inRightTopCorner =
      ftX >= RightX &&
      ftX <= (RightX + CORNER_THREE_RECT_WIDTH_FT) &&
      ftY >= TopY &&
      ftY <= (TopY + CORNER_THREE_RECT_HEIGHT_FT);
    const inRightBottomCorner =
      ftX >= RightX &&
      ftX <= (RightX + CORNER_THREE_RECT_WIDTH_FT) &&
      ftY >= BottomY &&
      ftY <= (BottomY + CORNER_THREE_RECT_HEIGHT_FT);

    const inCorner3 = inLeftTopCorner || inLeftBottomCorner || inRightTopCorner || inRightBottomCorner;
    const behindArc = distFt > THREE_RADIUS_FT;
    const is3 = inCorner3 || behindArc;

    return { is3, distFt, inCorner3, behindArc, inPaint };
  }

  function finalizeShot(madeOrShot = null, assistPlayer_id = null) {
    let src;
    let made = null;

    if (madeOrShot && typeof madeOrShot === "object") {
      src = madeOrShot;
    } else {
      made = madeOrShot;
      src = pendingShot;
    }

    if (!src) {
      console.warn("finalizeShot called with no pendingShot/event object");
      return;
    }

    const {
      ftX,
      ftY,
      player_id,
      teamId,
      courtSide,
      flipCourt,
      isFreeThrow,
      isBeyondHalfCourt,
      role,
      created_by,
      game_id,
      event_time,
      id
    } = src;

    if (!player_id) {
      console.error("finalizeShot: missing player_id — aborting", src);
      setPendingShot(null);
      setPopupStep(null);
      return;
    }
    
    let newEvent;
    console.log("finalizeShot: 1", pendingShot);
    if (isFreeThrow) {
      newEvent = {
        id: Date.now().toString(),
        type: "freeThrow",
        player_id,
        teamId,
        isFreeThrow: true,
        made: !!made,
        points: 1,
        distFt: 15,
        quarter,
        flipCourt,
        role,
        event_time: new Date(),
        created_by: userId,
        game_id: selectedGame.id,
      };
    } else if (isBeyondHalfCourt) {
      newEvent = {
        id: Date.now().toString(),
        type: "shot",
        player_id,
        teamId,
        isFreeThrow: false,
        isBeyondHalfCourt: true,
        ftX,
        ftY,
        is3: true,
        distFt: 50,
        made: !!made,
        points: 3,
        quarter,
        assistPlayer_id,
        flipCourt,
        role,
        event_time: new Date(),
        created_by: userId,
        game_id: selectedGame.id,
      };
    } else {
      
      const { is3, distFt, inCorner3, behindArc, inPaint } = computeShot(ftX, ftY, courtSide, flipCourt);
      const points = is3 ? 3 : 2;
      newEvent = {
        id: Date.now().toString(),
        type: "shot",
        player_id,
        teamId,
        isFreeThrow: false,
        ftX,
        ftY,
        is3,
        distFt,
        courtSide,
        inCorner3,
        behindArc,
        made: !!made,
        points,
        quarter,
        assistPlayer_id,
        flipCourt,
        role,
        inPaint,
        event_time: new Date(),
        created_by: userId,
        game_id: selectedGame.id,
      };
    }
    
    onAddEvent(newEvent);
    setPendingShot(null);
    setPopupStep(null);
    console.log("finalizeShot newEvent", newEvent)
  }

  function getTargetRimByTeam(teamId, flip) {
    const isHomeTeam = teamId === homeTeamId;

    if (!flip) {
      return isHomeTeam ? rimLeftPx : rimRightPx;
    } else {
      return isHomeTeam ? rimRightPx : rimLeftPx;
    }
  }

  const rightColumnPlayers = (flipCourt ? activeHomePlayers : activeAwayPlayers)
    .map(p => ({ ...p, teamId: flipCourt ? homeTeamId : awayTeamId }));

  const leftColumnPlayers = (flipCourt ? activeAwayPlayers : activeHomePlayers)
    .map(p => ({ ...p, teamId: flipCourt ? awayTeamId : homeTeamId }));

  //console.log("events", events)
  return (
    <main>
      <div className="court-container" onPointerDown={handlePointerDown}>
        <img
          className="court-image" 
          src={config.image} 
          alt="Basketball Court" 
          draggable={false}
        />
        <svg
          className="court-svg"
          ref={svgRef}
          viewBox={`0 0 ${COURT_WIDTH_PX} ${COURT_HEIGHT_PX}`}
        >
          {/* Debug layer */}
          {debug && (
            <g>
              {/* 3PT arcs */}
              <circle  
                className="3pt-arc"
                cx={rimLeftPx.x}
                cy={rimLeftPx.y}
                r={THREE_RADIUS_FT * scaleX}
                fill="none"
                stroke="red"
                strokeDasharray="6,4"
                opacity="0.5"
              />
              <circle
                cx={rimRightPx.x}
                cy={rimRightPx.y}
                r={THREE_RADIUS_FT * scaleX}
                fill="none"
                stroke="red"
                strokeDasharray="6,4"
                opacity="0.5"
              />

              {/* Rims */}
              {/* LEFT */}
              <circle
                cx={rimLeftPx.x}
                cy={rimLeftPx.y}
                r={7.5}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* RIGHT */}
              <circle
                cx={rimRightPx.x}
                cy={rimRightPx.y}
                r={7.5}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />

              {/* Corner 3 rectangles */}
              {/* TOP LEFT */}
              <rect
                x={ftToPxX(TopX)}
                y={ftToPxY(TopY)}
                width={rectWidthPx}
                height={rectHeightPx}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* BOTTOM LEFT */}
              <rect
                x={ftToPxX(TopX)}
                y={BottomYPx}
                width={rectWidthPx}
                height={rectHeightPx}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* TOP RIGHT */}
              <rect
                x={RightXPx}
                y={ftToPxY(TopY)}
                width={rectWidthPx}
                height={rectHeightPx}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* BOTTOM RIGHT */}
              <rect
                x={RightXPx}
                y={BottomYPx}
                width={rectWidthPx}
                height={rectHeightPx}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />

              {/* INSIDE THE PAINT */}
              {/* LEFT */}
              <rect
                x={ftToPxX(TopX)}
                y={ftToPxY(COURT_HEIGHT_FT / 2 - (INSIDE_PAINT_RECT_HEIGHT_FT/2))}
                width={ftToPxY(INSIDE_PAINT_RECT_WIDTH_FT)}
                height={ftToPxY(INSIDE_PAINT_RECT_HEIGHT_FT)}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* RIGHT */}
              <rect
                x={ftToPxX(COURT_WIDTH_FT - INSIDE_PAINT_RECT_WIDTH_FT)}
                y={ftToPxY(COURT_HEIGHT_FT / 2 - (INSIDE_PAINT_RECT_HEIGHT_FT/2))}
                width={ftToPxY(INSIDE_PAINT_RECT_WIDTH_FT)}
                height={ftToPxY(INSIDE_PAINT_RECT_HEIGHT_FT)}
                fill="none"
                stroke="red"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* 
                  <rect
                    x={COURT_WIDTH_PX / 2}
                    y={ftToPxY(0)}
                    width={.1} // A thin line
                    height={COURT_HEIGHT_PX}
                    fill="red"
                    stroke="red"
                    opacity="0.5"
                  />

                  <rect
                    x={ftToPxX(TopX)}
                    y={ftToPxY(COURT_HEIGHT_FT/2)}
                    width={ftToPxX(COURT_WIDTH_FT)} // A thin line
                    height={.1}
                    fill="red"
                    stroke="red"
                    opacity="0.5"
                  />
              */}
            </g>
          )}

          {/* Shots render marker*/}
          {events.map((shot) => {
          // Decide which rim to draw to using teamId and flipCourt
          const eventFlip = shot.flipCourt ?? false;
          // If for some reason teamId is missing, fallback to using courtSide (legacy)
          const rim = shot.teamId
            ? getTargetRimByTeam(shot.teamId, eventFlip)
            : (shot.courtSide === "away"
                ? (eventFlip ? rimLeftPx : rimRightPx)
                : (eventFlip ? rimRightPx : rimLeftPx)
              );

          const targetRimX = rim.x;
          const targetRimY = rim.y;
              
            return (
              <g key={shot.id}>
                {shot.type === "shot" && (
                  <>
                    {shot.made ? (
                      <circle
                        cx={ftToPxX(shot.ftX)}
                        cy={ftToPxY(shot.ftY)}
                        r="5"
                        fill="none"
                        stroke="green"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    ) : (
                      <>
                        <line
                          x1={ftToPxX(shot.ftX) - 5}
                          y1={ftToPxY(shot.ftY) - 5}
                          x2={ftToPxX(shot.ftX) + 5}
                          y2={ftToPxY(shot.ftY) + 5}
                          stroke="red"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                        <line
                          x1={ftToPxX(shot.ftX) + 5}
                          y1={ftToPxY(shot.ftY) - 5}
                          x2={ftToPxX(shot.ftX) - 5}
                          y2={ftToPxY(shot.ftY) + 5}
                          stroke="red"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      </>
                    )}
                  </>
                )}
                {debug && shot.type === "shot" && (
                  <>
                    <line
                      x1={ftToPxX(shot.ftX)}
                      y1={ftToPxY(shot.ftY)}
                      x2={targetRimX}
                      y2={targetRimY}
                      stroke="rgba(0,0,0,0.2)"
                    />
                    <text
                      x={ftToPxX(shot.ftX) + 8}
                      y={ftToPxY(shot.ftY) - 8}
                      fontSize={10}
                      fill="#222"
                    >
                      {shot.is3 ? "3PT" : "2PT"} ({Math.round(shot.distFt)})
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>



      {/* Controls */}
      <div
        className="buttons-group"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className={`game-control-btn ${
            selectedControl === "debug" ? "selected" : ""
          }`}
          onClick={() => {
            setDebug((prev) => !prev);
            setSelectedControl("debug");
          }}
        >
          {debug ? "Hide Details" : "Show Details"}
        </button>

        <button
          className="game-control-btn"
          onClick={() => onUndoEvent()}
          disabled={events.length === 0}
        >
          Undo
        </button>

        {(role === 'homeOffense' || role === 'awayOffense' || role === "admin") && (
          <>
            <button
              className="game-control-btn"
              onClick={() => {
                setPendingShot({ 
                  isFreeThrow: true,
                  flipCourt,
                  role,
                });
                setPopupStep("player");
              }}
            >
              Free Throw
            </button>

            <button
              className="game-control-btn"
              onClick={() => {
                setPendingShot({
                  ftX: COURT_WIDTH_FT / 2,
                  ftY: COURT_HEIGHT_FT / 2,
                  isBeyondHalfCourt: true,
                  flipCourt,
                  role,
                });
                setPopupStep("player");
              }}
            >
              Beyond Half Court
            </button>
          </>
        )}
      </div>

      




      {/* Popup: active player selection */}
      {popupStep === "player" && pendingShot && (
        <div className="popup">
          {pendingShot.isFreeThrow ? (
            <h3>Select Shooter (Free Throw)</h3>
          ) : pendingShot.isBeyondHalfCourt ? (
            <h3>Select Shooter (Beyond Half Court)</h3>
          ) : pendingShot.isRebound ? (
            <h3>Select Player (Offensive Rebound)</h3>
          ) : pendingShot.isTurnover ? (
            <h3>Select Player (Turnover)</h3>
          ) : (
            <h3>
              Select Shooter (
              {pendingShot.courtSide === "away" ? awayTeamName : homeTeamName})
            </h3>
          )}
          {pendingShot.isFreeThrow || pendingShot.isBeyondHalfCourt ? (role === "admin" ? 
          (
            <div className="free-throw-columns">
            {/* Left column (one team) */}
            <div className="team-column">
              <h4>{flipCourt ? awayTeamName : homeTeamName}</h4>
              <ul>
                {leftColumnPlayers.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setPendingShot({
                          ...pendingShot,
                          player_id: p.id,
                          teamId: p.teamId,
                        });
                        setPopupStep("result");
                      }}
                    >
                      #{p.number} - {p.name_first} {p.name_last}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right column (other team) */}
            <div className="team-column">
              <h4>{flipCourt ? homeTeamName : awayTeamName}</h4>
              <ul>
                {rightColumnPlayers.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setPendingShot({
                          ...pendingShot,
                          player_id: p.id,
                          teamId: p.teamId,
                        });
                        setPopupStep("result");
                      }}
                    >
                      #{p.number} - {p.name_first} {p.name_last}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="team-column">
            <h4>
              {role === "homeOffense"
                ? homeTeamName
                : role === "awayOffense"
                ? awayTeamName
                : ""}
            </h4>
            <ul>
              {(role === "homeOffense" ? activeHomePlayers : activeAwayPlayers).map(
                (p, index) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setPendingShot({
                          ...pendingShot,
                          player_id: p.id,
                          teamId:
                            role === "homeOffense" ? homeTeamId : awayTeamId,
                        });
                        setPopupStep("result");
                      }}
                    >
                      #{p.number} - {p.name_first} {p.name_last}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )) : pendingShot.isRebound || pendingShot.isTurnover ?(
            // Free Throw active roster
            <div className="free-throw-columns">
              {/* / away team active roster */}
              <div className="team-column">
                <h4>{flipCourt ? awayTeamName : homeTeamName }</h4>
                <ul>
                  {leftColumnPlayers.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          const eventData = {
                            ...pendingShot,
                            player_id: p.id,
                            teamId: p.teamId,
                          };
                          finalizeShot(eventData);
                        }}
                      >
                        #{p.number} - {p.name_first} {p.name_last}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* / home team active roster */}
              <div className="team-column">
                <h4>{flipCourt ? homeTeamName : awayTeamName}</h4>
                <ul>
                  {rightColumnPlayers.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          const eventData = {
                            ...pendingShot,
                            player_id: p.id,
                            teamId: p.teamId,
                          };
                          finalizeShot(eventData);
                        }}
                      >
                        #{p.number} - {p.name_first} {p.name_last}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            ) : (
            <ul> 
              {(pendingShot.courtSide === "away"
                ? activeAwayPlayers 
                : activeHomePlayers 
              ).map((p, index, arr) => {
                if (popupPlayers.length !== arr.length) {
                  setPopupPlayers( 
                    arr.map((pp) => ({
                      ...pp,
                      teamId: pendingShot.courtSide === "away" 
                        ? awayTeamId 
                        : homeTeamId, 
                    })) 
                  ); 
                }
                return ( 
                  <li key={p.id}>
                    <button 
                      onClick={() => { 
                        setPendingShot({ 
                          ...pendingShot, 
                          player_id: p.id, 
                          teamId: pendingShot.courtSide === "away" 
                            ? awayTeamId
                            : homeTeamId, 
                        }); 
                        setPopupStep("result"); 
                      }} 
                    > 
                      #{p.number} - {p.name_first} {p.name_last}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          
          <button onClick={handleCancel}>
            Cancel
          </button>
          </div>
        )}

      {/* Popup: event result */}
      {popupStep === "result" && pendingShot && (
        <div className="popup">
          <h3>Shot Result</h3>
          <ul>
            <li>
              <button
                onClick={() => {
                  if (pendingShot.isFreeThrow) {
                    finalizeShot(true);
                  } else {
                    setPendingShot({ ...pendingShot, made: true });
                    setPopupStep("assist");
                  }
                }}
              >
                Made
              </button>
            </li>
            <li>
              <button onClick={() => 
                finalizeShot(false)}
              >
                Missed
              </button>
            </li>
            <li>
              <button onClick={
                handleCancel}
              >
                Cancel
              </button>
            </li>
          </ul>
        </div>
      )}
      {/* Popup: assist selection */}
      {popupStep === "assist" && pendingShot && (
        <div className="popup">
          <h3>Select Assister</h3>
          <ul>
            {(pendingShot.teamId === awayTeamId
              ? activeAwayPlayers
              : activeHomePlayers
            )
              .filter((p) => p.id !== pendingShot.player_id)
              .map((p, index) => (
                <li key={p.id}>
                  <button
                    onClick={() => finalizeShot(true, p.id)}
                  >
                    #{p.number} - {p.name_first} {p.name_last}
                  </button>
                </li>
              ))}
          </ul>

          {/* No assist option */}
          <button onClick={() => finalizeShot(true, null)}>
              No Assist
          </button>

          <button onClick={handleCancel}>
            Cancel
          </button>
        </div>
        )}


    </main>
  );
}
