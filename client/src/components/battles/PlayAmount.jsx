
import React, { useState, useEffect } from "react";
import { getActiveBattlesGame } from "../../services/api.service";
import { battlesSocket } from "../../services/websocket.service";

// MUI Components
import Box from "@material-ui/core/Box";

export const PlayAmount = () => {
  const [playAmount, setPlayAmount] = useState(0);

  function onNew(battle) {
    setPlayAmount(current => current + battle.price)
  }

  function onFinished(battle) {
    setPlayAmount(current => current - battle.price)
  }

  // Fetch battles schema from API
  const fetchData = async () => {
    try {
      const schema = await getActiveBattlesGame();

      // Update state
      setPlayAmount(schema.reduce((a, b) => a + b.price, 0));
    } catch (error) {
      console.log("There was an error while loading Coinflip schema:", error);
    }
  };

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    battlesSocket.on("battles:new", onNew);
    battlesSocket.on("battles:finished", onFinished);

    return () => {
      battlesSocket.off("battles:new", onNew)
      battlesSocket.off("battles:finished", onFinished);
    };
  });

  return (
    <Box style={{ color: "#b7b7b7", fontSize: "11px", margin: "auto", marginLeft: "0px", }}>
      ${parseFloat(playAmount).toFixed(2)}
    </Box>
  );
};
