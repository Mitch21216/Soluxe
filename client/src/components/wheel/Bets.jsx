import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

// MUI Components
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    background: "#1f2734",
    width: "43%",
    height: "75vh",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginTop: 20,
    },
  },
  betAmount: {
    width: "100%",
    height: "3rem",
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    color: "#4b4e68",
    fontWeight: "bold",
    "& span": {
      display: "flex",
      marginLeft: "auto",
      color: "white",
    },
  },
  bets: {
    display: "flex",
    color: "white",
    height: "100%",
    flexDirection: "column",
    overflowY: "auto",
  },
  bet: {
    display: "flex",
    alignItems: "center",
    borderRadius: 3,
    marginBottom: 5,
    width: "100%",
    padding: 10,
    fontSize: 12,
    background: "#20243e",
    position: "relative",
  },
  avatar: {
    height: 25,
    width: 25,
  },
  multiplier: {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Bets = ({ players, loading }) => {
  const classes = useStyles();

  // Get multiplier from color
  const getMultiplier = color => {
    switch (color) {
      case "grey":
        return 1;
      case "purple":
        return 3;
      case "green":
        return 5;
      case "blue":
        return 10;
      
      case "gold":
        return 7;
      default:
        return "Invalid";
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.betAmount}>
        ALL BETS
        <span>
          {loading
            ? "Loading..."
            : "$" +
              players
                .map(player => parseFloat(player.betAmount))
                .reduce((a, b) => a + b, 0)
                .toFixed(2)}
        </span>
      </Box>

      <Box className={classes.bets}>
        {players
          .sort((a, b) => b.betAmount - a.betAmount)
          .map(player => (
            <Box key={player.betId} padding="0 1rem">
              <Box className={classes.bet}>
                <Avatar
                  className={classes.avatar}
                  src={player.avatar}
                  variant="rounded"
                />
                <Box ml={2}>{player.username}</Box>
                <Box className={classes.multiplier}>
                  {getMultiplier(player.color)}x
                </Box>
                <Box ml="auto">${player.betAmount.toFixed(2)}</Box>
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

Bets.propTypes = {
  players: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Bets;
