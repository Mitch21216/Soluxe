
import React, { useState, useEffect, useRef } from "react";
import { getJackpotSchema } from "../../services/api.service";
import { jackpotSocket } from "../../services/websocket.service";

export const PlayAmount = () => {
  const [playAmount, setPlayAmount] = useState(0);

  const smallRef = useRef(0)
  const mediumRef = useRef(0)
  const largeRef = useRef(0)

  function addSmallBet(player) {
    smallRef.current = smallRef.current + player?.betAmount || 0
    addBet(player)
  }

  function addMediumBet(player) {
    mediumRef.current = mediumRef.current + player?.betAmount || 0
    addBet(player)
  }

  function addLargeBet(player) {
    largeRef.current = largeRef.current + player?.betAmount || 0
    addBet(player)
  }

  function addBet(player) {
    setPlayAmount(amount => amount + player.betAmount)
  }

  function resetSmall() {
    setPlayAmount(amount => amount - smallRef.current)
    smallRef.current = 0
  }

  function resetMedium() {
    setPlayAmount(amount => amount - mediumRef.current)
    mediumRef.current = 0
  }

  function resetLarge() {
    setPlayAmount(amount => amount - largeRef.current)
    largeRef.current = 0
  }

  // Fetch jackpot schema from API
  const fetchData = async () => {
    try {
      const schema = await getJackpotSchema();

      const smallAmount = schema.current.players.reduce((a, b) => a + b.betAmount, 0);
      const mediumAmount = schema.currentMiddle.players.reduce((a, b) => a + b.betAmount, 0);
      const largeAmount = schema.currentHigh.players.reduce((a, b) => a + b.betAmount, 0);

      smallRef.current = smallAmount
      mediumRef.current = mediumAmount
      largeRef.current = largeAmount

      // Update state
      setPlayAmount(smallAmount + mediumAmount + largeAmount);
    } catch (error) {
      console.log("There was an error while loading jackpot schema:", error);
    }
  };

  useEffect(() => {
    fetchData();

    jackpotSocket.on("new-round-low", resetSmall);
    jackpotSocket.on("new-round-middle", resetMedium);
    jackpotSocket.on("new-round-high", resetLarge);
    jackpotSocket.on("new-player-low", addSmallBet);
    jackpotSocket.on("new-player-middle", addMediumBet);
    jackpotSocket.on("new-player-high", addLargeBet);

    // componentDidUnmount
    return () => {
      // Remove listeners
      jackpotSocket.off("new-round-low", resetSmall);
      jackpotSocket.off("new-round-middle", resetMedium);
      jackpotSocket.off("new-round-high", resetLarge);
      jackpotSocket.off("new-player-low", addSmallBet);
      jackpotSocket.off("new-player-middle", addMediumBet);
      jackpotSocket.off("new-player-high", addLargeBet);
    };
  });

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div style={{ color: "#b7b7b7", fontSize: "11px", margin: "auto", marginLeft: "0px", }}>
      ${parseFloat(playAmount).toFixed(2)}
    </div>
  );
};
