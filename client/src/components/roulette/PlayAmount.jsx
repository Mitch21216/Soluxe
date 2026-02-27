
import React, { useState, useEffect } from "react";
import { getRouletteSchema } from "../../services/api.service";
import { rouletteSocket } from "../../services/websocket.service";

export const PlayAmount = () => {
  const [playAmount, setPlayAmount] = useState(0);

  function addBet(player) {
    setPlayAmount(amount => amount + player?.betAmount || 0)
  }

  function resetRound() {
    setPlayAmount(0)
  }

  // Fetch roulette schema from API
  const fetchData = async () => {
    try {
      const schema = await getRouletteSchema();

      // Update state
      setPlayAmount(schema.current.players.reduce((a, b) => a + b.betAmount, 0));
    } catch (error) {
      console.log("There was an error while loading roulette schema:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    rouletteSocket.on("new-player", addBet);
    rouletteSocket.on("new-round", resetRound);

    // componentDidUnmount
    return () => {
      // Remove listeners
      rouletteSocket.off("new-player", addBet);
      rouletteSocket.off("new-round", resetRound);
    };
  });

  return (
    <div style={{ color: "#b7b7b7", fontSize: "11px", margin: "auto", marginLeft: "0px", }}>
      ${parseFloat(playAmount).toFixed(2)}
    </div>
  );
};
