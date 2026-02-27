
import React, { useState, useEffect } from "react";
import { getCrashSchema } from "../../services/api.service";
import { crashSocket } from "../../services/websocket.service";

import Box from "@material-ui/core/Box";

export const PlayAmount = () => {
  const [playAmount, setPlayAmount] = useState(0);

  function addBets(players) {
    if (!Array.isArray(players)) return
    setPlayAmount(amount => amount + players.reduce((pv, player) => pv + player?.betAmount || 0, 0))
  }

  function resetRound() {
    setPlayAmount(0)
  }

  // Fetch crash schema from API
  const fetchData = async () => {
    try {
      const schema = await getCrashSchema();

      // Update state
      setPlayAmount(schema.current.players.reduce((a, b) => a + b.betAmount, 0));
    } catch (error) {
      console.log("There was an error while loading crash schema:", error);
    }
  };

  useEffect(() => {
    fetchData();

    crashSocket.on("game-starting", resetRound);
    crashSocket.on("game-bets", addBets);

    // componentDidUnmount
    return () => {
      // Remove listeners
      crashSocket.off("game-starting", resetRound);
      crashSocket.off("game-bets", addBets);
    };
  });

  return (
    <Box style={{ color: "#b7b7b7", fontSize: "11px", margin: "auto", marginLeft: "0px", }}>
      ${parseFloat(playAmount).toFixed(2)}
    </Box>
  );
};
