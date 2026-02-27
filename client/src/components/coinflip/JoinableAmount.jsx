
import React, { useState, useEffect } from "react";
import { getUserPrivateCoinflipGamesJoinable } from "../../services/api.service";
import { coinflipSocket } from "../../services/websocket.service";

// MUI Components
import Box from "@material-ui/core/Box";

export const JoinableAmount = () => {
  const [joinableAmount, setjoinableAmount] = useState(0);

  function newGame(coinflip) {
    setjoinableAmount(amount => amount + coinflip.betAmount)
  }

  function endedGame(coinflip) {
    setjoinableAmount(amount => amount - coinflip.betAmount)
  }

  const fetchData = async () => {
    try {
      const activeFlips = await getUserPrivateCoinflipGamesJoinable();
      if (!Array.isArray(activeFlips)) return
      setjoinableAmount(activeFlips.reduce((pv, flip) => pv + flip.betAmount, 0));
    } catch (error) {
      console.log(
        "Error Coinflip:",
        error
      );
    }
  };

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    coinflipSocket.on("new-coinflip-game", newGame);
    coinflipSocket.on("game-rolled", endedGame);

    return () => {
      coinflipSocket.off("new-coinflip-game", newGame);
      coinflipSocket.off("game-rolled", endedGame);
    };
  }, []);

  return (
    <Box>
      {joinableAmount}
    </Box>
  );
};
