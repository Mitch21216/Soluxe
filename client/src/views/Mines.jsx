import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { getRouletteSchema } from "../services/api.service";
import { rouletteSocket } from "../services/websocket.service";
import PropTypes from "prop-types";

// MUI Components
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import Countdown from "react-countdown";

// Components
import BetsRed from "../components/roulette/BetsRed";
import BetsGreen from "../components/roulette/BetsGreen";
import BetsBlack from "../components/roulette/BetsBlack";
import HistoryEntry from "../components/roulette/HistoryEntry";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import placebet from "../assets/placebet.wav";
import error from "../assets/error.wav";

//import rollingSound from "../assets/rolling.wav";
//import toneSound from "../assets/tone.wav";

const errorAudio = new Audio(error);
const placebetAudio = new Audio(placebet);

//const rollingAudio = new Audio(rollingSound);
//const toneAudio = new Audio(toneSound);

const playSound = audioFile => {
  audioFile.play();
};

// Custom Styled Component
const BetInput = withStyles({
  root: {
    width: "100%",
    marginTop: "auto",
    marginRight: 10,
    border: "2px solid #31353d",
    background: "#1a1e23",
    borderRadius: "5px",
    "& :before": {
      display: "none",
    },
    "& :after": {
      display: "none",
    },
    "& label": {
      color: "#323956",
      fontSize: 15,
    },
    "& div input": {
      color: "#e4e4e4",
      fontFamily: "Rubik",
      fontSize: "14px",
      fontWeight: 500,
      letterSpacing: ".1em",
      padding: "0rem 0rem",
    },
    "& div": {
      height: "2.5rem",
      borderRadius: 4,
    },
  }
})(TextField);

// Custom Styles
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    width: "100%",
    paddingLeft: "105px",
    paddingRight: "105px",
    [theme.breakpoints.down("xs")]: {
      padding: "2rem 0.5rem 2rem 0.5rem",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "2rem 0.5rem 2rem 0.5rem",
    },
    [theme.breakpoints.down("md")]: {
      padding: "2rem 0.5rem 2rem 0.5rem",
    },
  },
  box: {
    marginBottom: 5,
  },
  logo: {
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "19px",
    fontWeight: 500,
    letterSpacing: ".1em",
    [theme.breakpoints.down("xs")]: {
      fontSize: 15,
      marginTop: 5,
    },
  },
  countdown: {
    fontSize: 20,
    left: "0px",
    right: "62px",
    top: "22px",
    position: "absolute",
    zIndex: "10",
    [theme.breakpoints.down("xs")]: {
      fontSize: 15,
      marginBottom: "20px",
      marginLeft: "5px",
      marginTop: "0px",
    },
  },
  controls: {
    overflow: "visible",
    marginBottom: "34px",
    display: "inherit",
    marginTop: "15px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "20px",
      marginTop: "-25px",
    },
  },
  right: {
    display: "flex",
    marginLeft: "-23px",
    height: "2.25rem",
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    transition: "all 800ms ease",
    marginRight: "-25px",
    paddingLeft: "5px",
    marginTop: "25px",
    maxWidth: "26rem",
    overflow: "hidden",
    [theme.breakpoints.down("xs")]: {
      marginRight: "-21px",
      maxWidth: "21rem",
    },
  },

  rouletteWrapper: {
    position: "relative",
    display: "flex",
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    borderRadius: "20px",
    justifyContent: "center",
    "&::before": {
      background: "linear-gradient(90deg,rgb(0,0,0) 0%,rgba(0,0,0,0) 100%)",
      content: '""',
      width: "1.5rem",
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      opacity: .4,
      zIndex: 1,
    },
    "&::after": {
      background: "linear-gradient(270deg,rgb(0,0,0) 0%,rgba(0,0,0,0) 100%)",
      content: '""',
      width: "1.5rem",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      opacity: .4,
      zIndex: 1,
    }
  },
  selector: {
    width: ".1875rem",
    background: "#fff",
    left: "calc(50% - 0.036rem)",
    height: "100%",
    position: "absolute",
    zIndex: "2",
    transition: "opacity .5s",
  },
  wheelR: {
    display: "flex",
  },
  rowR: {
    display: "flex",
    padding: "15px 0",
    background: "rgb(15 15 16 / 8%)",
    //contain: "layout style paint",
  },
  cardRed: {
    height: "68px",
    width: "68px",
    margin: "2.5px",
    borderRadius: ".625rem",
    textShadow: "1px 2px rgb(0 0 0 / 35%)",
    transition: "text-shadow .5s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5em",
    background: "#de4c41",
    boxShadow: "0 10px 27px #fa010133, inset 0 2px #e5564b, inset 0 -2px #ad362d",
  },
  cardBlack: {
    height: "68px",
    width: "68px",
    margin: "2.5px",
    borderRadius: ".625rem",
    textShadow: "1px 2px rgb(0 0 0 / 35%)",
    transition: "text-shadow .5s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5em",
    background: "#31353d",
    boxShadow: "0 10px 27px #010a1d1f, inset 0 2px #3b3f47, inset 0 -2px #272b33",
  },
  cardGreen: {
    height: "68px",
    width: "68px",
    margin: "2.5px",
    borderRadius: ".625rem",
    textShadow: "1px 2px rgb(0 0 0 / 35%)",
    transition: "text-shadow .5s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5em",
    background: "#00c74d",
    boxShadow: "0 10px 27px #00ff0c1a, inset 0 2px #35d87b, inset 0 -2px #00913c",
  },

  game: {
    display: "flex",
    width: "56%",
    height: "75vh",
    maxHeight: "800px",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      maxHeight: "500px",
    },
  },
  bets: {
    display: "flex",
    width: "43%",
    height: "75vh",
    maxHeight: "800px",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
  wheel: {
    maxHeight: "470px",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    margin: "auto",
    position: "relative",
    overflow: "hidden",
    background: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(0,0,0,.08) 0,rgba(0,0,0,.08) 20px)",
    border: "1px solid #161b21",
    boxShadow: "0 1.5px #191e24",
    marginTop: 0,
    borderRadius: 5,
    transition: "1s ease",
    maskImage: "linear-gradient(180deg,rgba(0,0,0,1) 88%,rgba(0,0,0,0) 98%)",
    [theme.breakpoints.down("xs")]: {
      maxHeight: "270px",
    },
  },
  disabled: {
    opacity: 0.25,
    transition: "0.25s ease",
    pointerEvents: "none",
    cursor: "not-allowed",
  },
  regular: {
    opacity: 1,
    transition: "0.25s ease",
    pointerEvents: "all",
    cursor: "pointer",
  },
  inputIcon: {
    marginTop: "0 !important",
    color: "#4fa0d8",
    background: "transparent !important",
  },
  contain: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  multiplier: {
    minWidth: "fit-content",
    backgroundColor: "#31353d",
    borderColor: "#31353d",
    color: "white",
    marginRight: 7,
    marginTop: "0.5rem",
    boxShadow: "none",
    fontFamily: "Rubik",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#31353d",
      borderColor: "#31353d",
      boxShadow: "none",
      transform: "translateY(-2px)",
      transition: "all 300ms ease",
    },
  },
  multiplier23: {
    minWidth: "fit-content",
    backgroundColor: "#31353d",
    borderColor: "#31353d",
    color: "white",
    marginRight: 7,
    marginTop: "0.5rem",
    boxShadow: "none",
    fontFamily: "Rubik",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#31353d",
      borderColor: "#31353d",
      boxShadow: "none",
      transform: "translateY(-2px)",
      transition: "all 300ms ease",
    },
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  amountbuttons: {
    display: "flex",
    paddingTop: "5px",
    marginTop: "-12px",
  },
  barContainer: {
    position: "relative",
  },
  bar: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    borderRadius: "0px",
    boxShadow: "0 1px #ffffff05, 0 1px 1px #0000001a inset",
    height: "0.25rem",
    [theme.breakpoints.down("xs")]: {
      marginTop: "-8px",
    },
  },
  sideButton: {
    flexDirection: "column",
    boxSizing: "border-box",
    display: "flex",
    placeContent: "stretch center",
    alignItems: "stretch",
    borderRadius: "0.5rem",
    background: "#1a1e23",
    boxShadow: "0 1px #ffffff05, 0 1px 1px #0000001a inset",
  },
  sideButton2: {
    flexDirection: "row",
    boxSizing: "border-box",
    display: "flex",
    placeContent: "center",
    alignItems: "center",
    flex: "1 1 100%",
    maxHeight: "50%",
    minHeight: "50px",
    fontWeight: 600,
    height: "50px",
  },
  sideRoll: {
    marginRight: "1rem",
    height: "1.875rem",
    width: "1.875rem",
    minWidth: "30px",
    lineHeight: "inherit",
    borderRadius: "50%!important",
  },
  sideRollButtonRed: {
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#de4c41!important", boxShadow: "0 10px 27px #fa010133,inset 0 2px #e5564b,inset 0 -2px #ad362d!important",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 300ms ease",
    },
    "&:active": {
      transform: "translateY(1px)",
      transition: "all 300ms ease",
      boxShadow: "none!important",
    },
  },
  sideRollButtonRedDisabled: {
    opacity: 0.25,
    transition: "0.25s ease",
    pointerEvents: "none",
    cursor: "not-allowed",
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#de4c41!important", boxShadow: "0 10px 27px #fa010133,inset 0 2px #e5564b,inset 0 -2px #ad362d!important",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 400ms ease",
    },
  },
  sideRollButtonGreen: {
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#00c74d!important", boxShadow: "0 10px 27px #00ff0c1a,0 -3px #00913c inset,0 2px #35d87b inset!important",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 300ms ease",
    },
    "&:active": {
      transform: "translateY(1px)",
      transition: "all 300ms ease",
      boxShadow: "none!important",
    },
  },
  sideRollButtonGreenDisabled: {
    opacity: 0.25,
    transition: "0.25s ease",
    pointerEvents: "none",
    cursor: "not-allowed",
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#00c74d!important", boxShadow: "0 10px 27px #00ff0c1a,0 -3px #00913c inset,0 2px #35d87b inset!important",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 400ms ease",
    },
  },
  sideRollButtonBlack: {
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#31353d!important", boxShadow: "0 10px 27px #010a1d1f,inset 0 2px #3b3f47,inset 0 -2px #272b33!important",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 400ms ease",
    },
    "&:active": {
      transform: "translateY(1px)",
      transition: "all 300ms ease",
      boxShadow: "none!important",
    },
  },
  sideRollButtonBlackDisabled: {
    opacity: 0.25,
    transition: "0.25s ease",
    pointerEvents: "none",
    cursor: "not-allowed",
    minHeight: "50px",
    borderRadius: "0.5rem!important",
    flex: "1 1 100%",
    boxSizing: "border-box",
    maxHeight: "50%",
    color: "#fff!important",
    overflow: "visible",
    padding: "0 16px",
    outline: "none",
    border: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    verticalAlign: "baseline",
    textAlign: "center",
    margin: 0,
    userSelect: "none",
    position: "relative",
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    backgroundColor: "#31353d!important", boxShadow: "0 10px 27px #010a1d1f,inset 0 2px #3b3f47,inset 0 -2px #272b33!important",
    "&:hover": {
      transform: "translateY(-2px)",
      transition: "all 400ms ease",
    },
  },
  betsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "2.5rem",
    color: "#bcbebf",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
      marginTop: "25px",
    },
  },
  betsContainerRedBets: {
    transition: "opacity .4s cubic-bezier(.17,.67,.34,1.21)",
  },
  betsContainerGreenBets: {
    transition: "opacity .4s cubic-bezier(.17,.67,.34,1.21)",
  },
  betsContainerBlackBets: {
    transition: "opacity .4s cubic-bezier(.17,.67,.34,1.21)",
  },
  betbuttonsactual: {
    display: "grid", 
    gridTemplateColumns: "1fr 1fr 1fr", 
    gap: "2.5rem",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr", 
    },
  },
  newClass: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  newTooltip: {
    cursor: "pointer",
    marginLeft: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  newBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

// Renderer callback with condition
const rendererR = ({ total, completed }, waitTime) => {
  if (completed) {
    // Render a completed state
    return "";
  } else {
    // Calculate remaining seconds and milliseconds
    const remainingTime = Math.max(waitTime - Date.now() + 50, 0); // add 50ms buffer
    const remainingSeconds = Math.floor(remainingTime / 1000);
    const displaySeconds = remainingSeconds % 60;
    const displayMilliseconds = (remainingTime % 1000).toString().padStart(3, "0").substring(0, 2);

    // Render a countdown
    return (
      <span style={{ letterSpacing: "0rem", width: "1px" }}>
        <div style={{ fontFamily: "Rubik", fontSize: "0.7em", lineHeight: "1.5em", fontWeight: "200", color: "#fff", marginLeft: "3px", }}>
        ROLLING
        </div>
        <span style={{ fontFamily: "Rubik", fontSize: "1.5em", lineHeight: "1.5em", fontWeight: "500", color: "#ffe063" }}>
          {displaySeconds}.{displayMilliseconds}
        </span>
      </span>
    );
  }
};

// Same game states as in backend
const GAME_STATES = {
  NotStarted: "Loading...",
  InProgress: "Rolling",
};

const Roulette = ({ user }) => {
  // Declare State
  const classes = useStyles();
  const { addToast } = useToasts();

  const [gameState, setGameState] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [players, setPlayers] = useState([]);

  const [waitTime, setWaitTime] = useState(5000);
  const [betAmount, setBetAmount] = useState("0.00");

  const [gameId, setGameId] = useState(null);
  const [privateHash, setPrivateHash] = useState(null);

  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [redAmount, setRedAmount] = useState(0);
  const [blackAmount, setBlackAmount] = useState(0);
  const [greenAmount, setGreenAmount] = useState(0);

  const [transitionTimingFunction, setTransitionTimingFunction] = useState("");  // Wheel Transition
  const [transitionDuration, setTransitionDuration] = useState("");  // Wheel Transition Duration
  const [wheelTransform, setWheelTransform] = useState("");  // Wheel Transform

  const [wheelTransformNumber1, setWheelTransformNumber1] = useState("scale(1)");
  const [wheelTransformNumber14, setWheelTransformNumber14] = useState("scale(1)");
  const [wheelTransformNumber2, setWheelTransformNumber2] = useState("scale(1)");
  const [wheelTransformNumber13, setWheelTransformNumber13] = useState("scale(1)");
  const [wheelTransformNumber3, setWheelTransformNumber3] = useState("scale(1)");
  const [wheelTransformNumber12, setWheelTransformNumber12] = useState("scale(1)");
  const [wheelTransformNumber4, setWheelTransformNumber4] = useState("scale(1)");
  const [wheelTransformNumber0, setWheelTransformNumber0] = useState("scale(1)");
  const [wheelTransformNumber11, setWheelTransformNumber11] = useState("scale(1)");
  const [wheelTransformNumber5, setWheelTransformNumber5] = useState("scale(1)");
  const [wheelTransformNumber10, setWheelTransformNumber10] = useState("scale(1)");
  const [wheelTransformNumber6, setWheelTransformNumber6] = useState("scale(1)");
  const [wheelTransformNumber9, setWheelTransformNumber9] = useState("scale(1)");
  const [wheelTransformNumber7, setWheelTransformNumber7] = useState("scale(1)");
  const [wheelTransformNumber8, setWheelTransformNumber8] = useState("scale(1)");

  const [wheelTransformNumber1zIndex, setWheelTransformNumber1zIndex] = useState(1);
  const [wheelTransformNumber14zIndex, setWheelTransformNumber14zIndex] = useState(1);
  const [wheelTransformNumber2zIndex, setWheelTransformNumber2zIndex] = useState(1);
  const [wheelTransformNumber13zIndex, setWheelTransformNumber13zIndex] = useState(1);
  const [wheelTransformNumber3zIndex, setWheelTransformNumber3zIndex] = useState(1);
  const [wheelTransformNumber12zIndex, setWheelTransformNumber12zIndex] = useState(1);
  const [wheelTransformNumber4zIndex, setWheelTransformNumber4zIndex] = useState(1);
  const [wheelTransformNumber0zIndex, setWheelTransformNumber0zIndex] = useState(1);
  const [wheelTransformNumber11zIndex, setWheelTransformNumber11zIndex] = useState(1);
  const [wheelTransformNumber5zIndex, setWheelTransformNumber5zIndex] = useState(1);
  const [wheelTransformNumber10zIndex, setWheelTransformNumber10zIndex] = useState(1);
  const [wheelTransformNumber6zIndex, setWheelTransformNumber6zIndex] = useState(1);
  const [wheelTransformNumber9zIndex, setWheelTransformNumber9zIndex] = useState(1);
  const [wheelTransformNumber7zIndex, setWheelTransformNumber7zIndex] = useState(1);
  const [wheelTransformNumber8zIndex, setWheelTransformNumber8zIndex] = useState(1);

  const [selectorOpacity, setselectorOpacity] = useState("0");
  const [selectorOpacityWrapper, setselectorOpacityWrapper] = useState("0.2");

  const [redResult, setredResult] = useState(false);
  const [blackResult, setblackResult] = useState(false);
  const [greenResult, setgreenResult] = useState(false);

  const [jackpotAmount, _setJackpotAmount] = useState(0.00);

  const setJackpotAmount = (amount) => {
    _setJackpotAmount(amount)
  }


  function spinWheel(roll, AnimationDuration, AnimationDurationTotal) {
    setselectorOpacityWrapper("1");
    setselectorOpacity("0.8");
    const order = [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4];
    const position = order.indexOf(roll);

    // determine position where to land
    const rows = 6;
    const card = 68 + 2.5 * 2;
    let landingPosition = (rows * 15 * card) + (position * card);

    const randomize = Math.floor(Math.random() * 68) - (68 / 2);
    landingPosition = landingPosition + randomize;

    const object = {
      x: Math.floor(Math.random() * 50) / 100,
      y: Math.floor(Math.random() * 20) / 100,
    };

    setTransitionTimingFunction(`cubic-bezier(0, ${object.x}, ${object.y}, 1)`);
    setTransitionDuration(`${AnimationDuration / 1000}s`);
    setWheelTransform(`translate3d(-${landingPosition}px, 0px, 0px)`);

    setTimeout(() => {
      setTransitionTimingFunction(`ease-in-out`);
      setTransitionDuration("1s");
      if (randomize >= 0 && randomize <= 34) {
        setWheelTransform(`translate3d(-${landingPosition - randomize}px, 0px, 0px)`);
      }
      if (randomize <= 0 && randomize >= -34) {
        setWheelTransform(`translate3d(-${landingPosition - randomize}px, 0px, 0px)`);
      }
    }, AnimationDuration + 1000);

    setTimeout(() => {
      setselectorOpacity("0");
      if (position === 0) {
        setWheelTransformNumber0("scale(1.28)");
        setWheelTransformNumber0zIndex(2);
        setgreenResult(true);
      }
      if (position === 1) {
        setWheelTransformNumber11("scale(1.28)");
        setWheelTransformNumber11zIndex(2);
        setblackResult(true);
      }
      if (position === 2) {
        setWheelTransformNumber5("scale(1.28)");
        setWheelTransformNumber5zIndex(2);
        setredResult(true);
      }
      if (position === 3) {
        setWheelTransformNumber10("scale(1.28)");
        setWheelTransformNumber10zIndex(2);
        setblackResult(true);
      }
      if (position === 4) {
        setWheelTransformNumber6("scale(1.28)");
        setWheelTransformNumber6zIndex(2);
        setredResult(true);
      }
      if (position === 5) {
        setWheelTransformNumber9("scale(1.28)");
        setWheelTransformNumber9zIndex(2);
        setblackResult(true);
      }
      if (position === 6) {
        setWheelTransformNumber7("scale(1.28)");
        setWheelTransformNumber7zIndex(2);
        setredResult(true);
      }
      if (position === 7) {
        setWheelTransformNumber8("scale(1.28)");
        setWheelTransformNumber8zIndex(2);
        setblackResult(true);
      }
      if (position === 8) {
        setWheelTransformNumber1("scale(1.28)");
        setWheelTransformNumber1zIndex(2);
        setredResult(true);
      }
      if (position === 9) {
        setWheelTransformNumber14("scale(1.28)");
        setWheelTransformNumber14zIndex(2);
        setblackResult(true);
      }
      if (position === 10) {
        setWheelTransformNumber2("scale(1.28)");
        setWheelTransformNumber2zIndex(2);
        setredResult(true);
      }
      if (position === 11) {
        setWheelTransformNumber13("scale(1.28)");
        setWheelTransformNumber13zIndex(2);
        setblackResult(true);
      }
      if (position === 12) {
        setWheelTransformNumber3("scale(1.28)");
        setWheelTransformNumber3zIndex(2);
        setredResult(true);
      }
      if (position === 13) {
        setWheelTransformNumber12("scale(1.28)");
        setWheelTransformNumber12zIndex(2);
        setblackResult(true);
      }
      if (position === 14) {
        setWheelTransformNumber4("scale(1.28)");
        setWheelTransformNumber4zIndex(2);
        setredResult(true);
      }

    }, AnimationDuration + 1800);

    setTimeout(() => {
    setPlayers([]);
  }, AnimationDuration + 5500);

    setTimeout(() => {
      setWheelTransformNumber0("scale(1)");
      setWheelTransformNumber1("scale(1)");
      setWheelTransformNumber2("scale(1)");
      setWheelTransformNumber3("scale(1)");
      setWheelTransformNumber4("scale(1)");
      setWheelTransformNumber5("scale(1)");
      setWheelTransformNumber6("scale(1)");
      setWheelTransformNumber7("scale(1)");
      setWheelTransformNumber8("scale(1)");
      setWheelTransformNumber9("scale(1)");
      setWheelTransformNumber10("scale(1)");
      setWheelTransformNumber11("scale(1)");
      setWheelTransformNumber12("scale(1)");
      setWheelTransformNumber13("scale(1)");
      setWheelTransformNumber14("scale(1)");
      setWheelTransformNumber0zIndex(1);
      setWheelTransformNumber1zIndex(1);
      setWheelTransformNumber2zIndex(1);
      setWheelTransformNumber3zIndex(1);
      setWheelTransformNumber4zIndex(1);
      setWheelTransformNumber5zIndex(1);
      setWheelTransformNumber6zIndex(1);
      setWheelTransformNumber7zIndex(1);
      setWheelTransformNumber8zIndex(1);
      setWheelTransformNumber9zIndex(1);
      setWheelTransformNumber10zIndex(1);
      setWheelTransformNumber11zIndex(1);
      setWheelTransformNumber12zIndex(1);
      setWheelTransformNumber13zIndex(1);
      setWheelTransformNumber14zIndex(1);
      setselectorOpacity("0");
      setselectorOpacityWrapper("0.2");
      setTransitionTimingFunction("");
      setTransitionDuration("");
      setredResult(false);
      setblackResult(false);
      setgreenResult(false);
      let resetTo = -(position * card);
      setWheelTransform(`translate3d(${resetTo}px, 0px, 0px)`);
    }, AnimationDurationTotal);
  }

  // Add new player to the current game
  const addNewPlayer = player => {
    setPlayers(state => [...state, player]);
  };

  // Button onClickRed event handler
  const onClickRed = () => {
    // Emit new bet event
    rouletteSocket.emit("join-game", "red", parseFloat(betAmount));
  };

  // Button onClickGreen event handler
  const onClickGreen = () => {
    // Emit new bet event
    rouletteSocket.emit("join-game", "green", parseFloat(betAmount));
  };

  // Button onClickBlack event handler
  const onClickBlack = () => {
    // Emit new bet event
    rouletteSocket.emit("join-game", "black", parseFloat(betAmount));
  };

  // TextField onChange event handler
  const onChange = e => {
    setBetAmount(e.target.value);
  };

  // New round started event handler
  const newRoundStarted = (countdownTime, gameId, privateHash) => {
    // Update state
    setPlayers([]);
    setGameId(gameId);
    setPrivateHash(privateHash);
    setWaitTime(Date.now() + countdownTime);
    setGameState("PLACE YOUR BETS");
    setTimeout(() => {
      setButtonsDisabled(false);
    }, 1000);
  };

  // Add game to history
  const addGameToHistory = game => {
    setHistory(state =>
      state.length >= 50
        ? [...state.slice(1, state.length), game]
        : [...state, game]
    );
  };

  // componentDidMount
  useEffect(() => {
    let unmounted = false;

    // Fetch roulette schema from API
    const fetchData = async () => {
      setLoading(true);
      try {
        const schema = await getRouletteSchema();

        // Update state
        setGameId(schema.current._id);
        setPrivateHash(schema.current.privateHash);
        setPlayers(schema.current.players);
        setWaitTime(Date.now() + schema.current.timeLeft);
        const previousWinningColors = schema.history.slice(0, 100).map((game) => game.winner);
        setRedAmount(previousWinningColors.filter((color) => color === "red").length);
        setBlackAmount(previousWinningColors.filter((color) => color === "black").length);
        setGreenAmount(previousWinningColors.filter((color) => color === "green").length);
        setHistory(schema.history.reverse());
        // set the jackpot amount
        _setJackpotAmount(schema.current.JACKPOT_STATE.amount)
        if (schema.current.timeLeft > 0) {
          setGameState("PLACE YOUR BETS");
          setWheelTransformNumber0("scale(1)");
          setWheelTransformNumber1("scale(1)");
          setWheelTransformNumber2("scale(1)");
          setWheelTransformNumber3("scale(1)");
          setWheelTransformNumber4("scale(1)");
          setWheelTransformNumber5("scale(1)");
          setWheelTransformNumber6("scale(1)");
          setWheelTransformNumber7("scale(1)");
          setWheelTransformNumber8("scale(1)");
          setWheelTransformNumber9("scale(1)");
          setWheelTransformNumber10("scale(1)");
          setWheelTransformNumber11("scale(1)");
          setWheelTransformNumber12("scale(1)");
          setWheelTransformNumber13("scale(1)");
          setWheelTransformNumber14("scale(1)");
          setWheelTransformNumber0zIndex(1);
          setWheelTransformNumber1zIndex(1);
          setWheelTransformNumber2zIndex(1);
          setWheelTransformNumber3zIndex(1);
          setWheelTransformNumber4zIndex(1);
          setWheelTransformNumber5zIndex(1);
          setWheelTransformNumber6zIndex(1);
          setWheelTransformNumber7zIndex(1);
          setWheelTransformNumber8zIndex(1);
          setWheelTransformNumber9zIndex(1);
          setWheelTransformNumber10zIndex(1);
          setWheelTransformNumber11zIndex(1);
          setWheelTransformNumber12zIndex(1);
          setWheelTransformNumber13zIndex(1);
          setWheelTransformNumber14zIndex(1);
          setselectorOpacity("0");
          setselectorOpacityWrapper("0.2");
          setButtonsDisabled(false);
        }
        if (schema.current.rollStatus) {
          setButtonsDisabled(true);
          gameRolled(schema.current.rollStatus.winningIndex, schema.current.rollStatus.winningMultiplier, schema.current.AnimationDuration, schema.current.AnimationDurationTotal);
        }
        setLoading(false);
      } catch (error) {
        console.log("There was an error while loading roulette schema:", error);
      }
    };

    // Game has rolled, show animation
    const gameRolled = (index, multiplier, AnimationDuration, AnimationDurationTotal) => {
      // Update state
      setGameState(GAME_STATES.InProgress);
      spinWheel(multiplier, AnimationDuration, AnimationDurationTotal);

      setButtonsDisabled(true);
    };

    //const onFocus = async () => {
    //  try {
    //
    //  } catch (error) {
    //    console.log("There was an error while loading roulette schema:", error);
    //  }
    //};

    // Error event handler
    const joinError = msg => {
      addToast(msg, { appearance: "error" });
      playSound(errorAudio);
    };

    const notificationJackpotWon = (amount) => {
      addToast(`You've got +$${parseFloat(amount).toFixed(2)} to the wallet because there was a triple green in roulette!`, {appearance: "success"})
      playSound(placebetAudio)
    }

    // Success event handler
    const joinSuccess = () => {
      playSound(placebetAudio);
    };

    if (!unmounted) {
      // Initially, fetch data
      fetchData();

      // Listeners
      rouletteSocket.on("new-player", addNewPlayer);
      rouletteSocket.on("game-join-error", joinError);
      rouletteSocket.on("game-join-success", joinSuccess);
      rouletteSocket.on("new-round", newRoundStarted);
      rouletteSocket.on("game-rolled", gameRolled);
      rouletteSocket.on("add-game-to-history", addGameToHistory);
      rouletteSocket.on("jackpot-amount", setJackpotAmount);
      rouletteSocket.on('jackpot-won', notificationJackpotWon);
      //window.addEventListener("focus", onFocus);
    }
    return () => {
      unmounted = true;
      // Remove Listeners
      rouletteSocket.off("new-player", addNewPlayer);
      rouletteSocket.off("game-join-error", joinError);
      rouletteSocket.off("game-join-success", joinSuccess);
      rouletteSocket.off("new-round", newRoundStarted);
      rouletteSocket.off("game-rolled", gameRolled);
      rouletteSocket.off("add-game-to-history", addGameToHistory);
      rouletteSocket.off("jackpot-amount", setJackpotAmount);
      rouletteSocket.off('jackpot-won', notificationJackpotWon);
      //window.removeEventListener("focus", onFocus);
    };
  }, [addToast, gameState]);

  return (
    <Box>
      <Box className={classes.root} style={{paddingTop: "30px"}}>
          <Container maxWidth="lg">
            <center style={{color: "white", fontSize: "30px", marginBottom: "100vh"}}>COMING SOON!</center>
          </Container>
      </Box>
    </Box>
  );
};

Roulette.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Roulette);