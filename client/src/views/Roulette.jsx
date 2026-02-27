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
            <Box className={classes.logo}>
              <Toolbar variant="dense" className={classes.controls}>
                <Box className={classes.newClass}>
                  <Box
                    style={{ display: "flex", marginLeft: "-15px", marginBottom: "-5px", fontSize: "12px", letterSpacing: ".09em", fontWeight: 300, }}
                  >
                    LAST 100
                    <span
                      style={{
                        marginLeft: "15px",
                        borderRadius: "50%",
                        background: "#de4c41",
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        marginRight: "0.3rem",
                        verticalAlign: "text-top",
                        boxShadow: "0 5px 12px #ff010133, inset 0 -1px #ad362d, inset 0 1px #e5564b",
                      }}
                    >
                    </span>
                    <Box
                      style={{
                        fontSize: "15px",
                        marginTop: "-2px",
                        marginLeft: "1px",
                        color: "#fff",
                        fontWeight: "500",
                      }}
                    >
                      {redAmount}
                    </Box>

                    <span
                      style={{
                        marginLeft: "15px",
                        borderRadius: "50%",
                        background: "#00c74d",
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        marginRight: "0.3rem",
                        verticalAlign: "text-top",
                        boxShadow: "0 5px 12px #00ff0c1a, inset 0 -1px #00913c, inset 0 1px #35d87b",
                      }}
                    >
                    </span>
                    <Box
                      style={{
                        fontSize: "15px",
                        marginTop: "-2px",
                        marginLeft: "1px",
                        color: "#fff",
                        fontWeight: "500",
                      }}
                    >
                      {greenAmount}
                    </Box>

                    <span
                      style={{
                        marginLeft: "15px",
                        borderRadius: "50%",
                        background: "#31353d",
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        marginRight: "0.3rem",
                        verticalAlign: "text-top",
                        boxShadow: "0 5px 12px #010a1d1f, inset 0 -1px #272b33, inset 0 1px #3b3f47",
                      }}
                    >
                    </span>
                    <Box
                      style={{
                        fontSize: "15px",
                        marginTop: "-2px",
                        marginLeft: "1px",
                        color: "#fff",
                        fontWeight: "500",
                      }}
                    >
                      {blackAmount}
                    </Box>
                    {loading ? (
                      <Tooltip
                        interactive
                        title={
                          <span>
                            Current Round ID: {gameId}
                            <br />
                            Private Hash: {privateHash}
                          </span>
                        }
                        placement="right"
                      >
                        <span style={{ cursor: "pointer", marginTop: "-4px", marginLeft: "20px", }}><InfoOutlinedIcon style={{ color: "rgb(87 93 106)", fontSize: "22px", }} /></span>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        interactive
                        title={
                          <span>
                            Current Round ID: {gameId}
                            <br />
                            Private Hash: {privateHash}
                          </span>
                        }
                        placement="right"
                      >
                        <span style={{ cursor: "pointer", marginTop: "-4px", marginLeft: "20px", }}><InfoOutlinedIcon style={{ color: "rgb(87 93 106)", fontSize: "22px", }} /></span>
                      </Tooltip>
                    )}
                  </Box>
                  <Box className={classes.newBox}>
                    JACKPOT: ${parseFloat(jackpotAmount).toFixed(2)}
                    <Tooltip
                        interactive
                        title={
                          <span>
                            What is the roulette jackpot?
                            <br />
                            Every bet made on roulette counts 1% of bet amount to the jackpot value. Once roulette hits triple green in a row, everyone who participated in that round gets a split (% by bet amount) of the jackpot total amount.
                          </span>
                        }
                        placement="right"
                      >
                        <span className={classes.newTooltip}><InfoOutlinedIcon style={{ color: "rgb(87 93 106)", fontSize: "22px", }} /></span>
                      </Tooltip>
                  </Box>
                </Box>
                <Box className={classes.right}>
                  {history.map((game, index) => (
                    <HistoryEntry key={index} game={game} />
                  ))}
                </Box>
              </Toolbar>
            </Box>
            <div className={classes.rouletteWrapper}>
            <Box className={classes.countdown} alignItems="center" display="flex">
              {loading ?
                <Box style={{ display: "flex", textAlign: "center", margin: "0 auto", }}>
                </Box>
                : gameState === GAME_STATES.InProgress ? (
                  <Box style={{ display: "flex", textAlign: "center", margin: "0 auto", }}>
                  </Box>
                ) : (
                  <Box style={{ display: "flex", textAlign: "center", margin: "0 auto", }}>
                    <Countdown key={waitTime} date={waitTime} renderer={(props) => rendererR(props, waitTime)} intervalDelay={0} precision={3} />
                  </Box>
                )}
            </Box>
              <div className={classes.selector} style={{ opacity: selectorOpacity }}></div>
              <div className={classes.wheelR} style={{ opacity: selectorOpacityWrapper, transitionTimingFunction: transitionTimingFunction, transitionDuration: transitionDuration, transform: wheelTransform, }}>
                {[...Array(15)].map((row, i) => (
                  <div key={i} className={classes.rowR}>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber1zIndex, transition: "all 400ms", transform: `${wheelTransformNumber1}`, WebkitTransform: `${wheelTransformNumber1}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber14zIndex, transition: "all 400ms", transform: `${wheelTransformNumber14}`, WebkitTransform: `${wheelTransformNumber14}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber2zIndex, transition: "all 400ms", transform: `${wheelTransformNumber2}`, WebkitTransform: `${wheelTransformNumber2}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber13zIndex, transition: "all 400ms", transform: `${wheelTransformNumber13}`, WebkitTransform: `${wheelTransformNumber13}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber3zIndex, transition: "all 400ms", transform: `${wheelTransformNumber3}`, WebkitTransform: `${wheelTransformNumber3}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber12zIndex, transition: "all 400ms", transform: `${wheelTransformNumber12}`, WebkitTransform: `${wheelTransformNumber12}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber4zIndex, transition: "all 400ms", transform: `${wheelTransformNumber4}`, WebkitTransform: `${wheelTransformNumber4}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardGreen} style={{ zIndex: wheelTransformNumber0zIndex, transition: "all 400ms", transform: `${wheelTransformNumber0}`, WebkitTransform: `${wheelTransformNumber0}`, }}><svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px", }}>
                      <path d="M26 15.5C26 16.7 25.69 17.8899 25.1 18.9399C24.51 19.9799 23.66 20.86 22.63 21.49C21.6 22.11 20.43 22.46 19.22 22.5C18.02 22.54 16.83 22.26 15.76 21.71L17.25 26.1799C17.31 26.3299 17.32 26.4899 17.29 26.6499C17.27 26.8099 17.21 26.9601 17.12 27.0801C17.02 27.2101 16.9 27.3199 16.76 27.3899C16.62 27.4599 16.4601 27.5 16.3101 27.5H9.68994C9.53994 27.5 9.37999 27.4599 9.23999 27.3899C9.09999 27.3199 8.98001 27.2101 8.88 27.0801C8.79 26.9601 8.72996 26.8099 8.70996 26.6499C8.67996 26.4899 8.69 26.3299 8.75 26.1799L10.24 21.71C9.16999 22.26 7.98003 22.54 6.78003 22.5C5.57003 22.46 4.39999 22.11 3.37 21.49C2.34 20.86 1.49002 19.9799 0.900024 18.9399C0.310024 17.8899 0 16.7 0 15.5C0 8.8 12.21 0.910078 12.73 0.580078C12.81 0.530078 12.9 0.5 13 0.5C13.1 0.5 13.19 0.530078 13.27 0.580078C13.79 0.910078 26 8.8 26 15.5Z" fill="white"></path>
                    </svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber11zIndex, transition: "all 400ms", transform: `${wheelTransformNumber11}`, WebkitTransform: `${wheelTransformNumber11}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber5zIndex, transition: "all 400ms", transform: `${wheelTransformNumber5}`, WebkitTransform: `${wheelTransformNumber5}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber10zIndex, transition: "all 400ms", transform: `${wheelTransformNumber10}`, WebkitTransform: `${wheelTransformNumber10}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber6zIndex, transition: "all 400ms", transform: `${wheelTransformNumber6}`, WebkitTransform: `${wheelTransformNumber6}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber9zIndex, transition: "all 400ms", transform: `${wheelTransformNumber9}`, WebkitTransform: `${wheelTransformNumber9}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                    <div className={classes.cardRed} style={{ zIndex: wheelTransformNumber7zIndex, transition: "all 400ms", transform: `${wheelTransformNumber7}`, WebkitTransform: `${wheelTransformNumber7}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg></div>
                    <div className={classes.cardBlack} style={{ zIndex: wheelTransformNumber8zIndex, transition: "all 400ms", transform: `${wheelTransformNumber8}`, WebkitTransform: `${wheelTransformNumber8}`, }}><svg style={{ width: "50px", height: "50px", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg></div>
                  </div>
                ))}
              </div>
            </div>
            <br />
            <BetInput
              label=""
              variant="filled"
              value={betAmount}
              onChange={onChange}
              InputProps={{
                endAdornment: (<Box className={classes.amountbuttons}>
                  <Button
                    className={classes.multiplier}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(0.00)
                    }
                  >
                    <span className={classes.reverse}>CLEAR</span>
                  </Button>
                  <Button
                    className={classes.multiplier23}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) + 1).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>+1</span>
                  </Button>
                  <Button
                    className={classes.multiplier23}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) + 10).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>+10</span>
                  </Button>
                  <Button
                    className={classes.multiplier23}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) + 100).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>+100</span>
                  </Button>
                  <Button
                    className={classes.multiplier23}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) + 1000).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>+1000</span>
                  </Button>
                  <Button
                    className={classes.multiplier}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) / 2).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>1/2</span>
                  </Button>
                  <Button
                    className={classes.multiplier23}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() =>
                      setBetAmount(
                        state => (parseFloat(state) * 2).toFixed(2) || 0
                      )
                    }
                  >
                    <span className={classes.reverse}>X2</span>
                  </Button>
                  <Button
                    className={classes.multiplier}
                    size="medium"
                    color="primary"
                    variant="contained"
                    onClick={() => setBetAmount(user ? user.wallet.toFixed(2) : 0)}
                  >
                    <span className={classes.reverse}>Max</span>
                  </Button></Box>),
                startAdornment: (
                  <InputAdornment
                    className={classes.inputIcon}
                    position="start"
                  >
                    <AttachMoneyIcon style={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
            />
            <br /><br />
            <Box>
              <Box className={classes.betbuttonsactual}>
                <Box>
                  <div className={classes.sideButton}>
                    <div className={classes.sideButton2}>
                      <div className={classes.sideRoll} style={{ background: "#de4c41", }}>
                      <svg style={{
                          height: "90%",
                          width: "100%",
                          padding: "0.30rem",
                          marginTop: "1px",
                          verticalAlign: "middle",
                          borderStyle: "none",
                        }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M115.999922,67.746595 C116.003457,69.4358139 115.886777,71.123125 115.650697,72.7955834 C115.297396,74.6262596 113.622337,76.9752095 113.622337,76.9752095 C112.040823,78.7761086 110.269477,80.3989596 108.339458,81.8152166 L100.02651,88.0303208 C98.991164,87.2480321 97.5662612,87.2480321 96.5309152,88.0303208 C94.6979101,89.3719808 95.4211366,91.2235551 95.8866617,91.5537456 C96.3521868,91.8839361 97.860987,91.7125714 97.860987,91.7125714 L97.8152657,92.6028318 C97.1805576,92.8370495 96.499493,92.9158511 95.8284711,92.8327112 C95.0636798,92.7365798 94.4318957,91.8170621 94.4318957,91.8170621 L93.5382538,90.7094611 C92.1863249,92.1066598 90.775535,93.4442332 89.3099036,94.7185657 C91.9060534,96.9529164 94.8510337,99.7758386 95.140273,100.053732 L95.1634352,100.076003 L97.5575643,99.8753813 C97.5944194,100.011407 97.6056965,100.153156 97.5908161,100.293344 C97.5534079,100.468888 95.9781041,102.521085 95.9781041,102.521085 C96.1034447,102.992628 95.9968365,103.496011 95.6913074,103.875284 C95.3937505,104.212019 94.9517883,104.381991 94.5067123,104.330863 C93.9593586,104.911421 93.3792661,105.459857 92.769306,105.973456 C92.6327981,106.007277 92.4901665,106.007277 92.3536586,105.973456 L92.3536586,105.973456 L92.0918007,103.699739 C92.0918007,103.699739 88.0932363,101.122801 84.5016882,98.5194537 C80.9074925,101.122332 76.9082004,103.699739 76.9082004,103.699739 L76.6463425,105.973456 C76.5100286,106.008848 76.367009,106.008848 76.2306951,105.973456 C75.6194697,105.459802 75.0379969,104.911373 74.4891324,104.330863 C74.0441471,104.381272 73.6025038,104.211422 73.3045372,103.875284 C73.0008758,103.495117 72.8944679,102.992679 73.0177405,102.521085 C73.0177405,102.521085 71.4424368,100.468888 71.4050285,100.293344 C71.3928023,100.152895 71.4054682,100.011378 71.4424368,99.8753813 L73.8365659,100.076003 L73.8597094,100.053732 C74.1488277,99.7757316 77.0936237,96.9507423 79.690864,94.7148122 C78.2250904,93.4428736 76.815879,92.1061459 75.4659038,90.7094611 L75.4659038,90.7094611 L74.5722619,91.8170621 C74.5722619,91.8170621 73.9363213,92.7365798 73.1756865,92.8327112 C72.5046646,92.9158511 71.8236,92.8370495 71.1888919,92.6028318 L71.1888919,92.6028318 L71.1390142,91.7125714 C71.1390142,91.7125714 72.6519708,91.8839361 73.1174959,91.5537456 C73.583021,91.2235551 74.3062475,89.3719808 72.4690859,88.0303208 C71.4345857,87.2501239 70.0121478,87.2501239 68.9776476,88.0303208 L68.9776476,88.0303208 L60.6646991,81.8152166 C58.734014,80.3982301 56.9613652,78.7754619 55.3776639,76.9752095 C55.3776639,76.9752095 53.7026048,74.6262596 53.3534609,72.7955834 C53.1145858,71.123376 52.9965099,69.4359625 53.0000785,67.746595 L53.0000785,67.746595 L57.1441654,71.7381379 C57.1441654,71.7381379 64.7962345,77.3639148 69.1979407,80.2269587 C71.8301153,81.9329045 74.3172606,83.8551368 76.6338731,85.9739447 C76.6338731,85.9739447 78.5333818,85.0753251 78.8783692,84.4985366 C79.2233565,83.9217482 78.7536749,83.0565656 78.7536749,83.0565656 L78.7536749,83.0565656 L79.314799,82.9604342 C79.314799,82.9604342 80.2500057,84.0011611 80.2832575,84.7576735 C80.3165093,85.5141858 79.3272684,86.2247222 79.3272684,86.2247222 L79.3272684,86.2247222 L78.3047757,87.2487307 C78.3047757,87.2487307 81.6177614,89.2064996 84.4983016,91.1059121 C87.3799438,89.2064996 90.6952254,87.2487307 90.6952254,87.2487307 L89.6685763,86.2289019 C89.6685763,86.2289019 88.6793354,85.5183654 88.7084307,84.7618531 C88.737526,84.0053408 89.6768892,82.9646138 89.6768892,82.9646138 L90.2421697,83.0607452 C90.2421697,83.0607452 89.7683316,83.9259279 90.113319,84.5027163 C90.4583064,85.0795047 92.3702845,85.9948428 92.3702845,85.9948428 C94.685914,83.8766311 97.1716282,81.9544304 99.8020604,80.2478568 C104.203767,77.3848129 111.855836,71.7590361 111.855836,71.7590361 L115.999922,67.746595 Z M84.6184601,46 L88.6502401,58.4761841 L102.108904,58.4761841 L91.2314106,65.7696318 L95.3380071,78.8184247 L84.6184601,70.6347166 C84.6184601,70.6347166 73.661994,78.4924138 73.4209185,78.8184247 L73.4209185,78.8184247 L77.8683459,66.158337 L66.7331515,58.4761841 L80.1086855,58.4761841 L84.6184601,46 Z" fill="#B3291E"/>
</svg>
                      </div>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", color: "#bcbebf", }}>Win 2x</span>
                    </div>
                    <button className={buttonsDisabled ? classes.sideRollButtonRedDisabled : classes.sideRollButtonRed} onClick={onClickRed}>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", }}>Place Bet</span>
                    </button>
                  </div>
                </Box>
                <Box>
                  <div className={classes.sideButton}>
                    <div className={classes.sideButton2}>
                      <div className={classes.sideRoll} style={{ background: "#00c74d", }}>
                        <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                          height: "90%",
                          width: "100%",
                          padding: "0.30rem",
                          marginTop: "1px",
                          verticalAlign: "middle",
                          borderStyle: "none",
                        }}>
                          <path d="M26 15.5C26 16.7 25.69 17.8899 25.1 18.9399C24.51 19.9799 23.66 20.86 22.63 21.49C21.6 22.11 20.43 22.46 19.22 22.5C18.02 22.54 16.83 22.26 15.76 21.71L17.25 26.1799C17.31 26.3299 17.32 26.4899 17.29 26.6499C17.27 26.8099 17.21 26.9601 17.12 27.0801C17.02 27.2101 16.9 27.3199 16.76 27.3899C16.62 27.4599 16.4601 27.5 16.3101 27.5H9.68994C9.53994 27.5 9.37999 27.4599 9.23999 27.3899C9.09999 27.3199 8.98001 27.2101 8.88 27.0801C8.79 26.9601 8.72996 26.8099 8.70996 26.6499C8.67996 26.4899 8.69 26.3299 8.75 26.1799L10.24 21.71C9.16999 22.26 7.98003 22.54 6.78003 22.5C5.57003 22.46 4.39999 22.11 3.37 21.49C2.34 20.86 1.49002 19.9799 0.900024 18.9399C0.310024 17.8899 0 16.7 0 15.5C0 8.8 12.21 0.910078 12.73 0.580078C12.81 0.530078 12.9 0.5 13 0.5C13.1 0.5 13.19 0.530078 13.27 0.580078C13.79 0.910078 26 8.8 26 15.5Z" fill="white"></path>
                        </svg>
                      </div>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", color: "#bcbebf", }}>Win 14x</span>
                    </div>
                    <button className={buttonsDisabled ? classes.sideRollButtonGreenDisabled : classes.sideRollButtonGreen} disabled={buttonsDisabled} onClick={onClickGreen}>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", }}>Place Bet</span>
                    </button>
                  </div>
                </Box>
                <Box>
                  <div className={classes.sideButton}>
                    <div className={classes.sideButton2}>
                      <div className={classes.sideRoll} style={{ background: "#31353d", }}>
                      <svg style={{                           height: "90%",
                          width: "100%",
                          padding: "0.30rem",
                          marginTop: "1px",
                          verticalAlign: "middle",
                          borderStyle: "none", }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="26" height="28" viewBox="49 64 70 24">
  <path d="M94.4507795,49 L94.6104122,49.1336005 C94.9641832,49.4455633 95.7962655,50.2721952 95.9656273,51.2760766 C96.0967944,52.1105303 96.0967944,52.9601682 95.9656273,53.7946219 C96.2764079,53.5252668 96.5420461,53.2084361 96.7525612,52.8560336 C96.9193303,52.4047399 97.0418735,51.9384973 97.1184855,51.4637943 C97.6751579,52.1825116 98.0381047,53.0305281 98.172977,53.9275886 C98.2335064,54.8715152 98.1526186,55.8191428 97.9329621,56.7394427 C98.2954302,56.3575085 98.6208271,55.9424289 98.9048255,55.499724 C99.1882245,54.8928361 99.4390832,54.2714546 99.6563474,53.6381905 C100.182511,54.5658701 100.539503,55.5787103 100.710839,56.6299407 C100.772925,57.6202403 100.725424,58.6143218 100.569191,59.5943155 L101.312841,58.8375536 C101.500115,58.6426957 101.670435,58.460418 101.749592,58.3624183 C102.08452,57.8013605 102.386678,57.2216055 102.654566,56.62603 C103.111481,57.7248453 103.410818,58.8820135 103.543801,60.0636096 C103.577196,61.1866033 103.39973,62.3059477 103.02049,63.3643118 C103.671928,63.0442574 104.298022,62.6755877 104.893393,62.2614706 C105.452661,61.7063911 105.978212,61.1187355 106.467261,60.5016175 C106.617058,61.5951273 106.668413,62.6997392 106.620713,63.8023197 C106.466882,64.9195844 106.109551,65.9996476 105.566221,66.9896091 C106.200395,66.8261313 106.823354,66.6223513 107.431255,66.3795267 C108.052932,66.1096826 109.398589,65.3275257 109.398589,65.3275257 L109.39941,65.6062482 C109.3914,66.2160946 109.317273,67.6805144 108.812324,68.5109044 C108.3849,69.2053402 107.894994,69.859818 107.348627,70.4662967 C107.831783,70.4456727 108.312944,70.3920993 108.788716,70.3059545 C109.41035,70.1058767 109.998984,69.8159815 110.535709,69.4455819 C110.409456,70.454176 110.133663,71.4386344 109.717298,72.366938 C109.183362,73.2521589 108.562593,74.0826856 107.864068,74.8463754 C108.336613,74.9420617 108.817994,74.9879414 109.300223,74.9832529 C109.879183,74.9206425 110.448517,74.7893483 110.996065,74.5921744 C110.816206,75.3865967 110.48207,76.1384886 110.012398,76.8056785 C109.487059,77.3424641 108.889593,77.803716 108.237385,78.1765496 L107.954566,78.3308845 L109.461544,78.448208 C109.976656,78.4490218 110.491043,78.4097944 111,78.3308845 C110.810604,79.3750817 110.279445,80.3278403 109.489087,81.0410582 C108.674167,81.701017 107.739071,82.1989204 106.734818,82.5076024 C107.212627,82.7290294 107.71425,82.8956593 108.229993,83.0042721 C108.699662,83.0796826 109.17465,83.1176079 109.650408,83.1176848 C109.401527,83.8651548 108.899532,84.5036979 108.229993,84.9244673 C107.686348,85.299288 107.057754,85.5344196 106.400371,85.6088546 C106.70435,85.7481018 107.026026,85.8454662 107.356496,85.8982527 L107.553206,85.9093351 C107.976086,85.9241117 108.536897,85.8982527 108.536897,85.8982527 L108.242327,86.2361587 C107.646975,86.8906223 106.207334,88.3356195 104.460579,89.1207392 C102.669997,89.9255579 100.587545,89.9520633 99.7464143,89.9237345 C99.8771643,90.1364669 99.9987343,90.3539518 100.112769,90.575551 C100.392655,91.3364885 100.583342,92.1264898 100.681368,92.9299026 L100.722643,93.3326542 L100.722643,101.330209 C100.537007,101.878837 100.18688,102.357852 99.7193022,102.702894 C99.317232,102.932383 98.8549713,103.032154 98.3959745,102.990921 L98.2241277,102.968827 C97.7694527,102.950079 97.3303045,102.799146 96.9610987,102.53473 C96.6326311,102.201371 96.3967441,101.789053 96.2764662,101.33803 L96.2764662,94.9908269 C96.2904653,94.2593925 96.1800528,93.5308626 95.9498886,92.8359845 C95.6355476,92.2302454 95.2527222,91.6621173 94.8088344,91.1426148 L84.5,77.8459472 L84.5,77.8263933 L84.5,77.8185717 L74.1911656,91.1347932 C73.7468742,91.6548274 73.3628002,92.2228498 73.0461767,92.828163 C72.8490821,93.4238174 72.7398105,94.0441299 72.7212857,94.6698083 L72.7195991,94.9830053 L72.7195991,101.33803 C72.5982888,101.789778 72.3625887,102.203116 72.0349666,102.538641 C71.718891,102.763123 71.3522992,102.905015 70.9688474,102.952819 L70.7758723,102.968827 C70.2602648,103.055016 69.7305381,102.961046 69.2767632,102.702894 C68.8077269,102.358427 68.4561813,101.879351 68.2694878,101.330209 L68.2694878,93.3287434 C68.3497641,92.3857575 68.5548237,91.4574141 68.8793615,90.5677295 C68.9940416,90.3448765 69.1163422,90.1261845 69.2460137,89.9120237 L68.9992053,89.9176162 C68.0445515,89.9293935 66.1729152,89.8419681 64.5394209,89.1090068 C62.2297699,88.0726489 60.4631032,85.8865203 60.4631032,85.8865203 L60.8969005,85.8997192 C61.1398664,85.9041188 61.4349666,85.9041188 61.6435041,85.8865203 C61.9739736,85.8337338 62.2956497,85.7363695 62.5996288,85.5971223 C62.0249964,85.533988 61.4724561,85.3458941 60.9808075,85.0473851 L60.7739421,84.912735 C60.1034207,84.493865 59.5999824,83.8566379 59.3495917,83.1098633 C59.8254052,83.1073572 60.3003046,83.0681315 60.7700074,82.9925397 C61.2865503,82.8840542 61.7893462,82.7187846 62.2691166,82.4997809 C61.2646781,82.1896484 60.3296114,81.6904329 59.5148478,81.0293258 C58.723417,80.321213 58.1906503,79.3721805 58,78.3308845 C58.5076504,78.4096705 59.0207199,78.4488978 59.5345212,78.448208 L61.0414996,78.3308845 C60.2793184,77.9329033 59.5848832,77.418208 58.9836674,76.8056785 C58.5131061,76.1389869 58.1788896,75.3869142 58,74.5921744 C58.5476974,74.7888475 59.1169704,74.9201276 59.6958426,74.9832529 C60.1781774,74.9904789 60.6598331,74.9445731 61.131997,74.8463754 C60.4346121,74.0841007 59.8151389,73.2548535 59.2827023,72.3708488 C58.8643255,71.4429925 58.5871757,70.4584274 58.4603563,69.4494927 C58.998059,69.8172678 59.5864911,70.1057461 60.2073497,70.3059545 C60.6831213,70.3920993 61.1642826,70.4456727 61.6474388,70.4662967 C61.1010709,69.859818 60.6111655,69.2053402 60.1837416,68.5109044 C59.5345212,67.4510817 59.6132146,65.3353473 59.6132146,65.3353473 L60.3652283,65.7606451 C60.7798441,65.9904037 61.2716778,66.2543816 61.5805494,66.3912591 C62.1835526,66.6295916 62.8012384,66.8294474 63.4298441,66.9896091 C62.8846748,66.002585 62.5246948,64.9252253 62.3674833,63.8101413 C62.3201355,62.7074421 62.3728105,61.6027451 62.5248701,60.5094391 C63.0147064,61.1259014 63.5402171,61.7135121 64.0987379,62.2692921 C64.6943471,62.6841922 65.320401,63.0541455 65.9716407,63.3760442 C65.5950502,62.3170116 65.4176617,61.198162 65.4483296,60.075342 C65.5834856,58.8924586 65.8841098,57.7341178 66.3414996,56.6338515 C66.6139619,57.234407 66.9200333,57.8193325 67.2582777,58.385883 L67.3650735,58.5093199 C67.6942908,58.8748664 68.4386785,59.6177802 68.4386785,59.6177802 C68.282545,58.6377653 68.2363576,57.643551 68.3009651,56.6534055 C68.4719432,55.6033193 68.8289709,54.5917023 69.3554566,53.665566 C69.5708801,54.2989552 69.8204365,54.9203646 70.1030438,55.5270995 C70.3858443,55.9640531 70.7088692,56.3739388 71.0679496,56.7514768 L71.0788419,56.7629074 C70.8576757,55.8388513 70.7754667,54.887326 70.8348924,53.9393209 C70.9707711,53.0425433 71.3336144,52.1947685 71.8893838,51.4755266 C71.966147,51.9489239 72.0886896,52.4138546 72.2553081,52.8638552 C72.4668975,53.2155017 72.7324032,53.5321745 73.042242,53.8024435 C72.9119599,52.9679217 72.9119599,52.1184199 73.042242,51.2838982 C73.2468448,49.9855177 74.5649592,49 74.5649592,49 L74.5562492,49.6109077 C74.5531795,50.1340871 74.5594149,50.8940641 74.6082405,51.4833482 C74.6734159,51.9118728 74.7722091,52.3340875 74.9034553,52.746189 C74.895399,52.3940179 74.9575404,52.0418933 75.0882702,51.7101737 C75.4541945,50.8615335 78.2084633,49.3910785 78.2084633,49.3910785 L76.9572551,52.3103072 C75.8766005,54.8535292 74.2781659,58.6679178 72.91159,62.1408077 L72.0839285,64.2765843 C70.9937987,67.1977136 67.1821042,78.2571947 70.6066815,81.6237651 C74.5649592,85.5149958 74.0062361,78.303509 73.9,77.7794638 C73.7803608,77.3021668 73.6332239,76.8320977 73.459317,76.3715814 C74.3076894,76.2380877 75.1757689,76.305076 75.9932442,76.5671206 C76.7295436,76.8571113 77.3590485,77.3605197 77.8013668,78.0095334 L77.9172977,78.1900962 L81.4191537,73.4697792 L79.6210097,69.9813594 L79.747071,60.3077379 C79.7586169,59.6331169 79.7682829,59.206018 79.7744618,59.1875939 C79.8548668,58.9530421 79.9700219,58.7321068 80.1158371,58.5319719 L80.2308834,58.385883 C80.4013451,58.1459217 80.6685557,57.991709 80.962732,57.9635183 L84.0396437,67.2594533 C83.4110946,67.3855389 82.9870671,67.9725023 83.0677803,68.6047632 C83.142539,69.5545737 84.0711582,69.6583759 84.3918951,69.6657532 L84.60781,69.662341 C84.9277112,69.6505543 85.8542106,69.5467522 85.9322197,68.5969416 C86.0078883,68.004197 85.6399372,67.4512647 85.0757393,67.2805722 L84.9603563,67.2516317 L88.0333333,57.9596075 C88.3292719,57.9886531 88.597848,58.1442525 88.7691166,58.385883 C88.969357,58.6260064 89.1240118,58.9003099 89.2255382,59.1954154 L89.2335849,59.3698845 C89.2552274,60.119095 89.2956774,63.1365523 89.3284293,65.7643886 L89.3789903,69.9891809 L87.5769117,73.4776008 L91.0905716,78.194007 C91.5369148,77.458527 92.2144524,76.8895519 93.0185598,76.5749422 C93.8346883,76.3129355 94.7014842,76.2459422 95.5485523,76.379403 C95.3770418,76.8390335 95.2312364,77.3077397 95.111804,77.7833746 L95.0908236,77.9247322 C94.9548311,79.0581104 94.6605931,85.3087812 98.4011878,81.6315867 C102.355531,77.7442668 96.6423905,63.5676726 96.6423905,63.5676726 L96.2017386,62.4341351 C93.8713714,56.4927796 90.7915367,49.4145432 90.7915367,49.4145432 L91.2275473,49.6575618 C92.0191537,50.1109072 93.6363029,51.0971582 93.9077951,51.7336384 C94.0429727,52.073221 94.1053858,52.4346469 94.0938169,52.7952406 C94.2317013,52.3675867 94.3358018,51.9288777 94.4035635,51.4833482 L94.4311701,51.0531197 C94.4771922,50.1084327 94.4507795,49 94.4507795,49 Z M84.5,80.880716 C84.6012887,80.8868686 84.6962286,80.9284209 84.7687611,80.9967028 L84.8187082,81.0527906 L84.940683,83.6339084 L84.9186734,83.6889038 C84.8747773,83.7878955 84.7655902,83.985879 84.5944321,83.985879 C84.4232739,83.985879 84.3008073,83.8142933 84.2502714,83.7285005 L84.2245731,83.6808378 L84.2245731,81.0762553 C84.2710972,80.964002 84.3780771,80.8880517 84.5,80.880716 Z M85.4325167,80.9041807 C85.5334095,80.8988194 85.6323289,80.9277782 85.7135482,80.9850592 L85.7708983,81.0332366 L86.1643653,83.3288672 L86.1468437,83.380624 C86.1112472,83.4742995 86.0197661,83.664217 85.857461,83.6847486 C85.7222068,83.7018583 85.6023223,83.6074495 85.5314291,83.5342368 L85.4639941,83.4540123 L85.1767632,81.1075415 C85.2177693,80.9980705 85.3160621,80.9199137 85.4325167,80.9041807 Z M83.5163326,80.90027 C83.6103749,80.9252448 83.6928917,80.9799925 83.7520015,81.0552342 L83.7917595,81.1153631 L83.4533779,83.4188152 L83.4012071,83.4931201 C83.3344634,83.5765502 83.2094284,83.6964809 83.0599109,83.6651947 C82.8917038,83.6299976 82.8009605,83.4540123 82.7661018,83.3682195 L82.749072,83.3210456 L83.213363,81.0175935 C83.2708144,80.944617 83.3566598,80.901228 83.4475674,80.8964617 L83.5163326,80.90027 Z M82.6467706,80.7594817 C82.7122975,80.7888221 82.7652543,80.8389732 82.7980444,80.9010417 L82.8238307,80.9667533 L82.2533036,82.9221456 L82.2277898,82.9585648 C82.1785449,83.0230927 82.0634558,83.1470157 81.9306607,83.1059525 C81.7978656,83.0648892 81.7646669,82.9094355 81.7563672,82.8342752 L81.7536006,82.7930897 L82.4106904,80.8376974 C82.4570009,80.7834976 82.5244924,80.7533656 82.5942874,80.7535541 L82.6467706,80.7594817 Z M86.321752,80.7594817 C86.3895947,80.7447594 86.4597578,80.7522957 86.5220918,80.7799507 L86.5814402,80.8142327 L87.214922,82.7383387 L87.2112333,82.7842293 C87.2016425,82.867639 87.167706,83.0384914 87.0496659,83.0707554 C86.9512992,83.0976421 86.8498585,83.0298144 86.7876108,82.9751627 L86.727023,82.914324 L86.1722346,80.9589317 C86.1786698,80.869154 86.2370405,80.7912899 86.321752,80.7594817 Z" id="Shape" fill="#575D6A" fillRule="nonzero"/>
</svg>
                      </div>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", color: "#bcbebf", }}>Win 2x</span>
                    </div>
                    <button className={buttonsDisabled ? classes.sideRollButtonBlackDisabled : classes.sideRollButtonBlack} disabled={buttonsDisabled} onClick={onClickBlack}>
                      <span style={{ fontFamily: "Rubik", fontWeight: "500", }}>Place Bet</span>
                    </button>
                  </div>
                </Box>
              </Box>
            </Box>
            <br />
            <Box className={classes.betsContainer}>
              <Box className={classes.betsContainerRedBets} style={{ opacity: buttonsDisabled && !redResult ? "0.3" : buttonsDisabled && redResult ? "1" : "1" }}><BetsRed players={players} redResult={redResult} blackResult={blackResult} greenResult={greenResult} /></Box>
              <Box className={classes.betsContainerGreenBets} style={{ opacity: buttonsDisabled && !greenResult ? "0.3" : buttonsDisabled && greenResult ? "1" : "1" }}><BetsGreen players={players} greenResult={greenResult} redResult={redResult} blackResult={blackResult} /></Box>
              <Box className={classes.betsContainerBlackBets} style={{ opacity: buttonsDisabled && !blackResult ? "0.3" : buttonsDisabled && blackResult ? "1" : "1" }}><BetsBlack players={players} blackResult={blackResult} greenResult={greenResult} redResult={redResult} /></Box>
            </Box>
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