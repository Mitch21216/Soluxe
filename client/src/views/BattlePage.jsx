import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from '@material-ui/core';
import { battlesSocket } from "../services/websocket.service";
import { useToasts } from "react-toast-notifications";
import { useHistory } from 'react-router-dom';
import parseCommasToThousands from "../utils/parseCommasToThousands";

import CountUp from 'react-countup';

import ProvablyModal from "../components/battles/ProvablyModal";

import confetti from 'canvas-confetti';
import spinSound from "../assets/spin.wav";
import confettiSound1 from "../assets/win1.webm";
import confettiSound2 from "../assets/win2.webm";
import confettiSound3 from "../assets/win3.webm";
import error from "../assets/error.wav";

import backdropImgGold from "../assets/csgold.webp";
import backdropImgRed from "../assets/csred.webp";
import backdropImgPink from "../assets/cspink.webp";
import backdropImgPurple from "../assets/cspurple.webp";
import backdropImgBlue from "../assets/csblue.webp";
import backdropImgLightBlue from "../assets/cslightblue.webp";
import backdropImgWhite from "../assets/cswhite.webp";

const errorAudio = new Audio(error);

const spinAudio = new Audio(spinSound);
spinAudio.playbackRate = 1.3;

const confettiAudio1 = new Audio(confettiSound1);
confettiAudio1.volume = 0.075;
const confettiAudio2 = new Audio(confettiSound2);
confettiAudio2.volume = 0.075;
const confettiAudio3 = new Audio(confettiSound3);
confettiAudio3.volume = 0.075;

const confettiAudioList = [confettiAudio1, confettiAudio2, confettiAudio3];

const playSound = audioFile => {
  audioFile.play();
};

const useStyles = makeStyles(theme => ({
  root: {
    padding: "32px",
    marginTop: "-10px",
    minHeight: "calc(100vh - 7rem)",
    color: "#fff",
    fontFamily: "Rubik",
    overflowY: "hidden"
  },
  battle: {
    padding: 0,
    margin: 0,
  },
  rowTop: {
    padding: 0,
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    width: "100%"
  },
  topLeftCol: {
    minWidth: 0,
    marginTop: "auto",
    marginBottom: "auto",
    display: "flex",
  },
  topMiddleCol: {
    textAlign: "center",
    margin: "auto",
    //marginRight: "2.7rem",
  },
  topRightCol: {
    display: "flex",
    flexDirection: "row",
  },
  backButton: {
    marginRight: "1rem",
    border: "1px solid #12171D",
    backgroundColor: "#12171D",
    color: "#fff",
    fontSize: ".95rem",
    fontWeight: 400,
    fontFamily: "Rubik",
    borderRadius: "4px",
    padding: ".5rem 1rem",
    lineHeight: "2rem",
    letterSpacing: "1px", 
    cursor: "pointer",
    transition: "all .15s ease-in-out",
    verticalAlign: "middle",
    display: "inline-block",
  },
  cancelButton: {
    marginRight: "1rem",
    border: "1px solid #B22222",
    backgroundColor: "#DC143C",
    color: "#fff",
    fontSize: ".95rem",
    fontWeight: 400,
    fontFamily: "Rubik",
    borderRadius: "4px",
    padding: ".5rem 1rem",
    lineHeight: "2rem",
    letterSpacing: "1px", 
    cursor: "pointer",
    transition: "all .15s ease-in-out",
    verticalAlign: "middle",
    display: "inline-block",
},
  description: {
    color: "#838b8d",
    marginRight: ".75rem",
    verticalAlign: "middle",
    fontFamily: "Rubik",
  },
  price: {
    fontWeight: 500,
    verticalAlign: "middle",
    fontFamily: "Rubik",
    marginTop: "15px",
  },
  priceWrapper: {
    display: "inline-flex",
    alignItems: "baseline",
    color: "#178ac9 !important",
  },
  priceWrapperImg: {
    position: "relative",
    height: "1rem",
    width: "1rem",
    marginRight: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },  
  caseButton: {
    transition: "all .15s ease-in-out",
    verticalAlign: "middle",
    display: "inline-block",
    borderRadius: "4px",
    lineHeight: "2rem",
    color: "#fff",
    fontWeight: 300,
    letterSpacing: ".5px",
    fontSize: "1.2rem",
    cursor: "inherit",
    background: "0 0",
    border: "none",
    fontFamily: "Rubik",
  },
  battleInfo: {
    width: "fit-content",
    padding: "1rem 1.75rem",
    textAlign: "center",
    marginLeft: "auto",
    fontFamily: "Rubik",
    marginTop: "15px",
  },
  link: {
    width: "fit-content",
    background: "#12171D",
    borderRadius: "4px",
    margin: "25px 0px 25px 25px",
    padding: "1rem 1rem",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    textAlign: "left",
    marginLeft: "auto",
    cursor: "pointer",
    fontFamily: "Rubik",
  },
  linkText: {
    color: "rgba(239,250,251,.5)",
    gridRow: 1,
    gridColumn: 1,
    fontSize: ".9rem",
    marginRight: "30px",
  },
  linkSvg: {
    gridRow: 1,
    gridColumn: 1,
    margin: "auto 0",
    marginLeft: "auto",
  },
  rowCases: {
    display: "flex",
    flexWrap: "wrap",
    border: "1px solid #2d2e2e",
    background: "#12171d",
    padding: "0.7rem 1.5rem 0.4rem 1.5rem",
    margin: "-0.5rem 0 1rem 0",
    borderRadius: "4px",
    color: "rgba(239,250,251,.5)",
  },
  middleLeftCol: {
    textAlign: "left",
    //maxWidth: "12rem",
    padding: 0,
    margin: 0,
    flexBasis: 0,
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  middleMiddleCol: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    flexBasis: 0,
    flexGrow: 1,
    maxWidth: "50%",
    overflow: "hidden",
    position: "relative",
    "-webkit-mask-image": "linear-gradient(to left,rgba(0,0,0,1) 45%,rgba(0,0,0,0))",
  },
  middleCol: {
    padding: 0,
    margin: "auto",
    flexBasis: 0,
    flexGrow: 1,
    maxWidth: "300px",
  },
  middleProvablyFairCol: {
    textAlign: "right",
    //maxWidth: "12rem",
    padding: 0,
    margin: 0,
    flexBasis: 0,
    flexGrow: 1,
    display: "flex",
    alignItems: "center", 
    justifyContent: "flex-end", 
  },
  createNewBattle: {
    //marginTop: "-10px",
    marginBottom: "6px",
    letterSpacing: ".1px",
    fontWeight: "500",
    background: "#178ac9 !important",
    color: "#fff !important",
    border: "1px solid #178ac9",
    cursor: "pointer",
    transition: "all .15s ease-in-out",
    verticalAlign: "middle",
    display: "flex",
    borderRadius: "4px",
    maxWidth: "300px",
    justifyContent: "center",
    padding: ".5rem 1rem",
    lineHeight: "2rem",
    fontSize: ".95rem",
    marginLeft: "auto",
    marginRight: "auto",
    fontFamily: "Rubik",
  },
  provFairSvg: {
    opacity: .75,
    gridRow: 1,
    gridColumn: 1,
    margin: "auto 0",
    marginLeft: "auto",
    marginRight: "5.9rem",
  },
  rowSpinners: {
    columnGap: "1.5rem",
    display: "grid",
    position: "relative",
    padding: 0,
    margin: 0,
    
  },
  spinnerLeft: {
    marginLeft: "-.5rem",
    textAlign: "left",
    gridColumn: 1,
    marginTop: "5rem",
    zIndex: 99,
    height: "20rem",
    display: "grid",
    gridRow: 1,
    padding: 0,
  },
  spinnerRight: {
    marginRight: "-.5rem",
    textAlign: "right",
    marginTop: "5rem",
    zIndex: 99,
    height: "20rem",
    display: "grid",
    gridRow: 1,
    padding: 0,
    margin: 0,
  },
  spinnerCol: {
    padding: 0,
    margin: 0,
    display: "grid",
    gridRow: 1,
    maxWidth: "100%",
  },
  spinner1: {
    gridColumn: 1
  },
  spinner2: {
    gridColumn: 2
  },
  spinner3: {
    gridColumn: 3
  },
  spinner4: {
    gridColumn: 4
  },
  rowTopDone: {
    background: "#12171D",
    width: "100%",
    borderRadius: "4px 4px 0 0",
    height: "5rem",
    padding: 0,
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
  },
  leftCol: {
    minWidth: 0,
    margin: "auto",
    display: "grid",
    padding: 0,
    flexBasis: 0,
    flexGrow: 1,
    maxWidth: "100%",
  },
  profile: {
    margin: 0,
    display: "grid",
  },
  picture: {
    gridRow: 1,
    gridColumn: 1,
    margin: "auto auto auto 0",
  },
  profilePicture: {
    height: "3rem",
    width: "3rem",
    border: "2px solid #178ac9",
    boxSizing: "border-box",
    borderRadius: "4px",
    margin: "0 1rem",
    float: "left",
  },
  text: {
    gridRow: 1,
    gridColumn: 1,
    margin: "-.15rem 0 auto 5rem",
  },
  username: {
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 500,
    display: "block",
    letterSpacing: "1px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "0rem",
  },
  level: {
    fontSize: ".6rem",
    fontWeight: 500,
    display: "block",
    letterSpacing: "1px",
    backgroundColor: "#178ac9",
    borderRadius: "4px",
    color: "#fff",
    padding: ".1rem .4rem",
    float: "left",
    marginTop: ".25rem",
  },
  rightCol: {
    textAlign: "right",
    display: "flex",
    flexDirection: "row",
    margin: "auto",
  },
  numberClick: {
    height: "3rem",
    background: "#178ac9",
    borderRadius: "4px",
    minWidth: "6rem",
    maxWidth: "10rem",
    marginLeft: "auto",
    marginRight: "1rem",
    display: "grid",
  },
  click: {
    cursor: "pointer",
    height: "100%",
    width: "100%",
    alignItems: "center",
    display: "flex",
    margin: 0,
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: 100,
    letterSpacing: ".5px",
    textAlign: "center",
    color: "#fff"
  },
  disabled: {
    cursor: "pointer",
    height: "100%",
    width: "100%",
    alignItems: "center",
    display: "flex",
    margin: 0,
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: 500,
    opacity: 0.5,
    letterSpacing: ".5px",
    textAlign: "center",
    backgroundColor: "#313338",
    color: "#000"
  },
  middle: {
    background: "#12171D",
    width: "100%",
    display: "grid",
    overflow: "hidden",
    height: "20rem",
    position: "relative",
  },
  topShade: {
    background: "linear-gradient(0deg,rgba(21,23,25,.8),rgba(31,34,37,0))",
    height: "8rem",
    gridColumn: 1,
    gridRow: 1,
    width: "100%",
    transform: "rotate(180deg)",
  },
  bottomShade: {
    marginTop: "12rem",
    background: "linear-gradient(0deg,rgba(21,23,25,.8),rgba(31,34,37,0))",
    height: "8rem",
    gridColumn: 1,
    gridRow: 1,
    width: "100%",
  },
  bottom: {
    background: "#12171D",
    width: "100%",
    padding: "1rem",
    borderRadius: "0 0 4px 4px",
  },
  rowDrops: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(14rem,1fr))",
    columnGap: "1rem",
    rowGap: "1rem",
    marginTop: ".1rem",
  },
  drop: {
    maxWidth: "100%",
    padding: 0,
    margin: 0,
  },
  blankDrop: {
    display: "grid",
    gridTemplateRows: "1fr",
    overflow: "hidden",
    background: "#0D1116",
    borderRadius: "4px",
    height: "6rem",
    textAlign: "center",
  },
  number: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "0.25rem",
    backgroundColor: "#0D1116",
    gap: "0.75rem",
    padding: "0.625rem 0.75rem",
    height: "100%",
  },
  countdown: {
    position: "absolute",
    zIndex: 100,
    left: "50%",
    top: "200px",
    textAlign: "center",
    color: "#fff",
    WebKitTransform: "translate(-50%,-50%)",
    transform: "translate(-50%,-50%)",
    padding: 0,
    margin: 0,
  },
  countdownText: {
    textAlign: "center",
    color: "#464B4D",
  },
  countdownNum: {
    fontSize: "4em",
    lineHeight: "1.1em",
    color: "#fff",
    fontWeight: 700,
    WebKitTransformOrigin: "center",
    transformOrigin: "center",
  },
  caselist: {
    transition: "transform .25s ease-out 0s,-webkit-transform .25s ease-out 0s",
    //transitionTimingFunction: "ease-out, ease-out",
    transitionTimingFunction: "cubic-bezier(.1,0,.2,1)",
    width: "40px",
    display: "flex",
  },
  left: {
    transform: "matrix(-1,0,0,1,0,0) scaleX(-1)",
    left: 0,
    background: "linear-gradient(90deg,rgba(21,23,25,.8),rgba(31,34,37,0))",
    borderRadius: "4px 0 0 4px",
    height: "100%",
    width: "40%",
    position: "absolute",
    zIndex: 999,
    textAlign: "left",
    maxWidth: "12rem",
  },
  right: {
    background: "linear-gradient(90deg,rgba(21,23,25,.8),rgba(31,34,37,0))",
    borderRadius: "4px 0 0 4px",
    height: "100%",
    width: "40%",
    position: "absolute",
    zIndex: 999,
    WebKitTransform: "matrix(-1,0,0,1,0,0)",
    transform: "matrix(-1,0,0,1,0,0)",
    right: 0,
    textAlign: "right",
    maxWidth: "12rem",
  },
  
  inner: {
    padding: "0",
    //width: "85%",
    left: "20%",
    display: "flex",
    justifyContent: "center",
    overflowX: "clip",
    "-webkit-mask-image": "linear-gradient(to right,rgba(0,0,0,1) 50%,rgba(0,0,0,0))",
  },
  active: {
    //marginLeft: "-1rem",
  },
  case: {
    maxWidth: "6rem",
    transition: "all .25s ease-in-out",
  },
  inactiveImg: {
    maxHeight: "3.5rem",
    WebKitFilter: "grayscale(1)",
    filter: "grayscale(1)",
  },
  activeImg: {
    WebKitFilter: "grayscale(0) !important",
    filter: "grayscale(0) !important",
    WebKitTransform: "scale(1) !important",
    transform: "scale(1) !important",
  },
  balance: {
    height: "3rem",
    background: "linear-gradient(0deg,#0d1116,#0d1116),linear-gradient(0deg,#0d1116,#0d1116)",
    borderRadius: "4px",
    minWidth: "6rem",
    maxWidth: "10rem",
    marginLeft: "auto",
    marginRight: "1rem",
    display: "grid",
    position: "relative",
  },
  winner: {
    background: "linear-gradient(0deg,rgba(78,162,77,.2),rgba(78,162,77,.2)),linear-gradient(0deg,rgba(21,23,25,.5),rgba(21,23,25,.5))"
  },
  wrap: {
    fontSize: "1rem",
    fontWeight: 500,
    margin: "auto 1rem",
    letterSpacing: ".5px",
    textAlign: "center",
  },
  count: {
    margin: 0,
    fontSize: "0.8rem",
    fontWeight: 500,
    letterSpacing: ".5px",
    textAlign: "center",
  },
  img: {
    height: "16px",
    position: "absolute",
    left: "50%",
    top: "50%",
    WebKitTransform: "translate(-50%,-45%)",
    transform: "translate(-50%,-45%)",
  },
  crownSvg: {
    top: "-1.5rem",
    left: "27%",
    display: "inherit",
    overflow: "hidden",
    position: "absolute",
  },
  dropImg: {
    position: "relative",
    flexShrink: 0,
    height: "4rem",
    width: "4rem",
  },
  dropText: {
    display: "flex",
    minWidth: "0px",
    flexDirection: "column",
    lineHeight: "1.25rem",
    gap: "0.375rem",
    fontSize: "13px",
    textAlign: "left",
  },
  dropItem: {
    position: "relative",
    zIndex: 10,
    height: "100%",
    width: "100%",
  },
  dropBackground: {
    display: "flex",
    MozBoxAlign: "center",
    alignItems: "center",
    MozBoxPack: "center",
    justifyContent: "center",
    position: "absolute",
    inset: "0px",
    margin: "auto",
  },
  dropActualImg: {
    position: "absolute",
    height: "100%",
    width: "100%",
    inset: "0px",
    color: "transparent",
    zIndex: 10,
    objectFit: "contain",
  },
  backdropWrapper: {
    display: "flex",
    MozBoxAlign: "center",
    alignItems: "center",
    MozBoxPack: "center",
    justifyContent: "center",
    position: "absolute",
    inset: "0px",
    margin: "auto",
  },
  backdropImg: {
    maxHeight: "70%",
    maxWidth: "70%",
    objectFit: "contain",
    zIndex: 0,
    height: "auto",
  },
  itemNameBox: {
    minWidth: "0px",
    flexGrow: 1,
    lineHeight: 1.25,
  },
  itemType: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: "#4A4E51"
  },
  itemName: {
    minWidth: "0px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "rgb(255 255 255 / var(--tw-text-opacity))"
  },
  dropPriceWrapper: {
    display: "inline-flex",
    WebKitAlignItems: "center",
    WebKitBoxAlign: "center",
    MsFlexAlign: "center",
    alignItems: "center",
    gap: "0.375rem",
    color: "rgb(255 255 255 / var(--tw-text-opacity))",
  },
  dropImgPriceWrapper: {
    display: "block",
    height: "1rem",
    width: "1rem",
  },
  dropImgPrice: {
    display: "block",
    verticalAlign: "middle",
  },
  lossText: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "3px",
    color: "#ef4444",
  },
  winnerText: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "3px",
    color: "#22c55e",
  },
  lossTextContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    MozBoxAlign: "center",
    alignItems: "center",
    MozBoxPack: "center",
    justifyContent: "center",
    color: "rgb(239 68 68 / var(--tw-text-opacity))",
    opacity: 0.5,
    backgroundColor: "rgba(248, 113, 113, 0.21)",
  },
  winTextContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    MozBoxAlign: "center",
    alignItems: "center",
    alignSelf: "auto",
    MozBoxPack: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 101, 52, 0.4)",
    color: "rgb(34 197 94 / var(--tw-text-opacity))",
  },
  noGames: {
    "&:after": {
      top: "-20px",
      content: "' .'",
      animation: "dots 1s steps(5, end) infinite",
  },
  },
  priceCont: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
    letterSpacing: "0.05em",
    color: "rgb(255 255 255 / var(--tw-text-opacity))"
  },
  priceCont2: {
    display: "inline-flex",
    MozBoxAlign: "center",
    alignItems: "center",
    gap: "0.375rem",

  },
  priceImgCont: {
    display: "block",
    height: "1rem",
    width: "1rem",
  },
  priceImg: {
    display: "block",
    verticalAlign: "middle",
  },
  finishedGradient: {
    zIndex: 10,
    inset: "0px",
    pointerEvents: "none",
    "--tw-border-spacing-x": "0",
    "--tw-border-spacing-y": "0",
    "--tw-translate-x": "0",
    "--tw-translate-y": "0",
    "--tw-rotate": "0",
    "--tw-skew-x": "0",
    "--tw-skew-y": "0",
    "--tw-scale-x": "1",
    "--tw-scale-y": "1",
    "--tw-pan-x": "var(--tw-empty, )",
    "--tw-pan-y": "var(--tw-empty, )",
    "--tw-pinch-zoom": "var(--tw-empty, )",
    "--tw-scroll-snap-strictness": "proximity",
    "--tw-gradient-from-position": "var(--tw-empty, )",
    "--tw-gradient-via-position": "var(--tw-empty, )",
    "--tw-gradient-to-position": "var(--tw-empty, )",
    "--tw-ordinal": "var(--tw-empty, )",
    "--tw-slashed-zero": "var(--tw-empty, )",
    "--tw-numeric-figure": "var(--tw-empty, )",
    "--tw-numeric-spacing": "var(--tw-empty, )",
    "--tw-numeric-fraction": "var(--tw-empty, )",
    "--tw-ring-offset-shadow": "0 0 #0000",
    "--tw-ring-shadow": "0 0 #0000",
    "--tw-shadow": "0 0 #0000",
    "--tw-shadow-colored": "0 0 #0000",
    "--tw-ring-inset": "var(--tw-empty, )",
    "--tw-ring-offset-width": "0px",
    "--tw-ring-offset-color": "#fff",
    "--tw-ring-color": "rgb(59 130 246 / 0.5)",
    "--tw-blur": "var(--tw-empty, )",
    "--tw-brightness": "var(--tw-empty, )",
    "--tw-contrast": "var(--tw-empty, )",
    "--tw-grayscale": "var(--tw-empty, )",
    "--tw-hue-rotate": "var(--tw-empty, )",
    "--tw-invert": "var(--tw-empty, )",
    "--tw-saturate": "var(--tw-empty, )",
    "--tw-sepia": "var(--tw-empty, )",
    "--tw-drop-shadow": "var(--tw-empty, )",
    "--tw-backdrop-blur": "var(--tw-empty, )",
    "--tw-backdrop-brightness": "var(--tw-empty, )",
    "--tw-backdrop-contrast": "var(--tw-empty, )",
    "--tw-backdrop-grayscale": "var(--tw-empty, )",
    "--tw-backdrop-hue-rotate": "var(--tw-empty, )",
    "--tw-backdrop-invert": "var(--tw-empty, )",
    "--tw-backdrop-opacity": "var(--tw-empty, )",
    "--tw-backdrop-saturate": "var(--tw-empty, )",
    "--tw-backdrop-sepia": "var(--tw-empty, )",
    "--tw-gradient-from": "#0000005c var(--tw-gradient-from-position)",
    "--tw-gradient-to": "#0000005c var(--tw-gradient-to-position)",
    "--tw-gradient-stops": "var(--tw-gradient-from),transparent var(--tw-gradient-via-position),var(--tw-gradient-to)",
    backgroundImage: "linear-gradient(to bottom, var(--tw-gradient-stops))",
    position: "absolute",
  },
  boxes: {
    /*position: "absolute",
    display: "inline-flex",
    ["-moz-box-align"]: "center",
    alignItems: "center",
    top: "50%",
    width: "100%",
    flexDirection: "column",*/
  },
  door: {
    width: "100%",
    height: "178px",
  },
  box: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "3rem",
    width: "100%",
  },
  itemNumber: {
    position: "relative",
    //top: "40%",
    //left: "70%",
    //transform: "translate(-50%, -50%)",
    color: "#fff", // AADE4E
    fontSize: "0.9rem",
    fontFamily: "Rubik",
    marginLeft: "55px",
    marginTop: "-15px",
  },
  spinImg: {
    height: "110px",
    objectFit: "cover",
    marginBottom: "1rem",
  },
  canvas: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 10000,
  }
}));

const BattlePage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { battleId } = useParams();
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState([]);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [gameCases, setGameCases] = useState([]);
  const [roundNum, setRoundNum] = useState(0);
  const [gameState, setGameState] = useState("waiting");
  const [countNum, setCountNum] = useState(3);
  const [battleHash, setBattleHash] = useState("");
  const [battlePublicSeed, setBattlePublicSeed] = useState("");
  const [battlePrivateSeed, setBattlePrivateSeed] = useState("");
  const [balanceData, setBalanceData] = useState([]);
  const [callingBots, setCallingBots] = useState(false);
  const [joining, setJoining] = useState(false);
  const [itemMoveLeft, setItemMoveLeft] = useState(0);

  const [totalCaseCount, setTotalCaseCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedMode, setSelectedMode] = useState("1v1");
  const [selectedBox, setSelectedBox] = useState("standard");

  const [modalVisible, setModalVisible] = useState(false);

  const itemsRef = useRef([]);

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const calcNewBalance = async (data) => {
    setBalanceData(prev => {
      let array = [];
      
      for(let i = 0; i < data.result.length; i++) {
        let obj = {
          balance: parseFloat((prev[i].balance + data.result[i].item.price).toFixed(2)),
          isWinner: false,
        }
  
        array.push(obj);
      }

      return array;
    })
  }

  const calcNewBalanceOnLoad = async (data) => {
    setBalanceData(prev => {
      let array = [];
      
      for(let i = 0; i < data.players.length; i++) {
        let obj = {
          balance: 0,
          isWinner: false,
          amountWon: 0
        }

        for(let j = 0; j < data.casesRoundResults.length; j++) {
          obj.balance += parseFloat((data.casesRoundResults[j][i].item.price).toFixed(2));
        }

        array.push(obj);
      }

      return array;
    })
  }
  
  const calcBalanceDataForWinner = async (data) => {
    setBalanceData(prev => {
      let array = [];
      for(let i = 0; i < data.pc; i++) {
        let obj = {
          balance: prev[i].balance,
          isWinner: false,
          amountWon: 0
        }
        if(data.isEqual) {
          if(data.bt === 4) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          } else if(data.equals[0] === i+1) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          } else if(data.equals[1] === i+1) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          } else if(data.equals[2] === i+1) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          } else if(data.equals[3] === i+1) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          }
          array.push(obj);
          continue;
        } else {
          if(data.bt === 4) {
            if(data.winningTeam === 1) {
              if(i+1 === 1 || i+1 === 2) {
                obj = {
                  balance: prev[i].balance,
                  isWinner: true,
                  amountWon: data.winAmount
                }
              }
            } else if(data.winningTeam === 2) {
              if(i+1 === 3 || i+1 === 4) {
                obj = {
                  balance: prev[i].balance,
                  isWinner: true,
                  amountWon: data.winAmount
                }
              }
            }
          } else if(data.winningTeam === i+1) {
            obj = {
              balance: prev[i].balance,
              isWinner: true,
              amountWon: data.winAmount
            }
          }
          array.push(obj);
          continue;
        }
      }

      return array;
    })
  }

  const pushNewHistory = async (data) => {
    setGameData(prev => {
      const w = prev;
      const k = prev.casesRoundResults;
      w.casesRoundResults = [...k, data];
      return w;
    });
  }

  const getFilterForItem = (item) => {
    // const totalTickets = 100000; 
    // const ticketPercentage = (item.ticketsEnd - item.ticketsStart + 1) / totalTickets * 100;
  
    let filter = "";
    if (item.color === "white") {
      filter = backdropImgWhite; // white
    } else if (item.color === "lightblue") {
      filter = backdropImgLightBlue; // lightblue
    } else if (item.color === "blue") {
      filter = backdropImgBlue; // blue
    } else if (item.color === "purple") {
      filter = backdropImgPurple; // purple
    } else if (item.color === "pink") {
      filter = backdropImgPink; // pink
    } else if (item.color === "red") {
      filter = backdropImgRed; // red
    }
    else {
      filter = backdropImgGold; // gold
    }
  
    return filter;
  };

    // Check Color Function
    function CheckItemColor(itemcolor) {
      if (itemcolor === "white") {
        return backdropImgWhite;
      }
      if (itemcolor === "lightblue") {
        return backdropImgLightBlue;
      }
      if (itemcolor === "blue") {
        return backdropImgBlue;
      }
      if (itemcolor === "purple") {
        return backdropImgPurple;
      }
      if (itemcolor === "pink") {
        return backdropImgPink;
      }
      if (itemcolor === "red") {
        return backdropImgRed;
      }
      else {
        console.log(itemcolor);
        return backdropImgGold;
      }
    };

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        battlesSocket.emit("battles:reqdata", battleId);
      } catch (error) {
        console.log("There was an error while loading case battles data:", error);
      }
    };

    let doors = document.querySelectorAll('#door');

    const triggerConfetti = (canvasIndex) => {
      const container = document.querySelector(`#canvas-${canvasIndex}`);
      if (container) {
        const myConfetti = confetti.create(container, {
          resize: true,
        });
        playSound(confettiAudioList[Math.floor(Math.random() * 3)]);
        myConfetti({
          particleCount: 50,
          spread: 50,
          origin: {
            x: 0.5, 
            y: 1.3,
          }
        });
      }
    };
  
    async function init(firstInit = true, groups = 1, duration = 1, data) {
      let i = 0;
  
      doors = document.querySelectorAll('#door');
  
      for (const door of doors) {
        if (firstInit) {
          door.dataset.spinned = '0';
        } else if (door.dataset.spinned === '1') {
          return;
        }
  
        const boxes = door.querySelector('#boxes');
        const boxesClone = boxes.cloneNode(false);
        let pool = ['❓'];
  
        if (!firstInit) {
          const arr = [];
          for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
            arr.push(...itemsRef.current);
          }
          let t = shuffle(arr);
          t.splice(27, 0, data.result[i].item);
          pool = t;
        }
  
        for (let i = pool.length - 1; i >= 0; i--) {
          const box = document.createElement('div');
          box.classList.add('box');
          box.classList.add(classes.box);
  
          const image = document.createElement('img');
          image.classList.add(classes.spinImg)
  
          const rarityFilter = getFilterForItem(pool[i]); 
          
          image.style.backgroundImage = `url(${rarityFilter})`;
          image.style.backgroundSize = '65%';
          image.style.backgroundRepeat = 'no-repeat';
          image.style.backgroundPosition = '25px 15px';
  
          image.src = pool[i].image
          box.appendChild(image);
  
          box.dataset.index = i;
          boxesClone.appendChild(box);
        }
        boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
        boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
        door.replaceChild(boxesClone, boxes);
        i++;
      }
    }
  
    async function spin(data) {
      init(false, 1, 2, data);
      const r = Math.floor(Math.random() * 6)+1;
      let w = [];
        for (const door of doors) {
        const boxes = door.querySelector('#boxes');
        const duration = parseInt(boxes.style.transitionDuration);
        const targetIndex = boxes.childElementCount - 30;
        const targetPosition = -door.clientHeight * targetIndex;
        boxes.style.transform = `translateY(${targetPosition}px)`;
        boxes.style.transition = `all 5s cubic-bezier(0.2, 0.4, 0.1, ${r === 4 ? '1.05' : '1.0'})`;
        boxes.style.transitionDuration = `${duration + 2}s`;
        const boxToScaleUp = door.querySelector('.box[data-index="27"]');
        w.push(boxToScaleUp);
      }
  
      await new Promise((resolve) => setTimeout(resolve, 4000));
  
      let i = 0;
      for (const box of w) {
        if(!box) return;
        const image = box.querySelector('img');
        image.style.backgroundSize = '45%'; // (65 / 1.4) = 46.4285%
        image.style.backgroundPosition = '35px 23px'; // (25 / 1.4) = 17.8571px, (15 / 1.4) = 10.7143px
        image.style.transitionDuration = '0.4s';
        image.style.transform = 'scale(1.5)';
        image.style.animation = '3s ease 0s infinite beat2';
        image.style.marginLeft = '20px';
        image.style.filter = data.result[i].item.color === "white" ? "drop-shadow(rgba(176, 195, 217, 1) 0px 0px 110px)" 
                           : data.result[i].item.color === "lightblue" ? "drop-shadow(rgba(94, 152, 217, 1) 0px 0px 110px)" 
                           : data.result[i].item.color === "blue" ? "drop-shadow(rgba(75, 105, 255, 1) 0px 0px 110px)"
                           : data.result[i].item.color === "purple" ? "drop-shadow(rgba(136, 71, 255, 1) 0px 0px 110px)" 
                           : data.result[i].item.color === "pink" ? "drop-shadow(rgba(211, 46, 230, 1) 0px 0px 110px)"
                           : data.result[i].item.color === "red" ? "drop-shadow(rgba(228, 56, 56, 1) 0px 0px 110px)"
                           : "drop-shadow(rgb(255, 215, 0) 0px 0px 110px)";
  
        const stattrack = data.result[i].item.stattrack;
        const type = data.result[i].item.type;
        const itemname = data.result[i].item.name;
  
        const number = parseCommasToThousands(parseFloat((data.result[i].item.price)));
  
        const numberElement = document.createElement('span');
        numberElement.classList.add('number');
        numberElement.classList.add(classes.itemNumber)
        numberElement.innerHTML = `<span style="color: rgb(234, 88, 12);">${stattrack === "Yes" ? "StatTrak™" : ""} <span style="color: #4A4E51;">${type}</span></span>
        <br/><span style="color: #fff;">${itemname}</span><br/><br/>$${number}`;
        if(data.result[i].item.color === "gold" || data.result[i].item.color === "red") {
          triggerConfetti(i);
        }
        box.appendChild(numberElement);
        i++;
      }
    }
  
    function shuffle([...arr]) {
      let m = arr.length;
      while (m) {
        const i = Math.floor(Math.random() * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
      }
      return arr;
    }

    fetchData();
    init();

    const setBattlesData = async (x) => {
      setGameData(x);
      if(x.status === 2) {
        setGameState("spinning");
        calcNewBalanceOnLoad(x);
        // Check if more than one round has already been played
        if (x.casesRoundResults.length > 1) {
          setItemMoveLeft(x.casesRoundResults.length * -53 + 53);
        }
      } else if(x.status === 3) {
        setGameState("finished");
        await calcNewBalanceOnLoad(x);
        await calcBalanceDataForWinner(x.win);
      } else {
        setGameState("waiting");
        calcNewBalanceOnLoad(x);
      }      
      setGamePlayers(prev => [...prev, ...x.players]);
      setGameCases(x.cases);
      setTotalCaseCount(x.cases.length);
      setTotalCost(x.price);
      setRoundNum(prev => x.casesRoundResults.length)
      setBattleHash(x.hash);
      setBattlePublicSeed(x.publicSeed);
      setBattlePrivateSeed(x.privateSeed);
      if(x.isCrazyMode)
      {
        setSelectedBox("crazy");
      }
      if(!x.isCrazyMode) {
        setSelectedBox("standard");
      }
      if(x.gameType === 1)
      {
        setSelectedMode('1v1');
      }
      if(x.gameType === 2)
      {
        setSelectedMode('1v1v1');
      }
      if(x.gameType === 3)
      {
        setSelectedMode('1v1v1v1');
      }
      if(x.gameType === 4)
      {
        setSelectedMode('2v2');
      }
      setLoading(false);
    }

    const error = msg => {
      addToast(msg, { appearance: "error" });
      setJoining(false);
      playSound(errorAudio);
    };

    const success = msg => {
      addToast(msg, { appearance: "success" });
    };

    const playerJoin = data => {
      if(data.battleId !== battleId) return;
      setGamePlayers(prevPlayers => [...prevPlayers, data.user]);
      setBalanceData(prev => [...prev, {
        balance: 0,
        isWinner: false
      }]);
    };

    const startCountdown = async () => {
      setGameState("countdown");
      for (let i = 3; i > 0; i--) {
        setCountNum(i);
        await delay(1000); 
      }
      setCountNum(0); 
    };

    const gameStart = async (data) => {
      if(data.battleId !== battleId) return;
      await startCountdown();
      setGameState("spinning");
      setBattleHash(data.hash)
      setBattlePublicSeed(data.publicSeed)
    }

    const newRound = async (data) => {
      if(data.battleId !== battleId) return;
      setRoundNum(prevRound => prevRound+1);
      if (data.caseNumber > 0) {
        setItemMoveLeft((prevItemMoveLeft) => prevItemMoveLeft - 53);
      }
      itemsRef.current = data.img; // Update the ref with the new items
      await delay(250);
      spin(data);
      playSound(spinAudio);
      await delay(4000);
      pushNewHistory(data.result)
      calcNewBalance(data);
    }

    const gameFinished = async (data) => {
      if(data.battleId !== battleId) return;
      calcBalanceDataForWinner(data);
      setGameState("finished");
      setBattlePrivateSeed(data.privateSeed);
    }

    const fwd = (battleIdnew) => {
      setTimeout(() => {
        history.push(`/battles/${battleIdnew}`);
      }, 300)
    }

    const bcancelled = () => {
      setTimeout(() => {
        history.push(`/battles`);
        error(`The battle game #${battleId} was cancelled!`)
      }, 300)
    }
    
    battlesSocket.on('battles:data', setBattlesData);
    battlesSocket.on("battles:error", error);
    battlesSocket.on("battles:success", success);
    battlesSocket.on("battles:join", playerJoin);
    battlesSocket.on("battles:start", gameStart);
    battlesSocket.on("battles:round", newRound);
    battlesSocket.on("battles:finished", gameFinished);
    battlesSocket.on("battles:created", fwd);
    battlesSocket.on("battles:cancelled", bcancelled)
    return () => {
      battlesSocket.off('battles:data', setBattlesData);
      battlesSocket.off("battles:error", error);
      battlesSocket.off("battles:success", success);
      battlesSocket.off("battles:join", playerJoin);
      battlesSocket.off("battles:start", gameStart);
      battlesSocket.off("battles:round", newRound);
      battlesSocket.off("battles:finished", gameFinished);
      battlesSocket.off("battles:created", fwd);
      battlesSocket.off("battles:cancelled", bcancelled)
    };
  }, [addToast, history, battleId, classes.box, classes.itemNumber, classes.spinImg]);
  
  const cancelBattle = () => {
    battlesSocket.emit(
      'battles:cancel',
      battleId
    )
  }

  const handleCreateBattle = () => {
    battlesSocket.emit(
      "battles:create",
      gameCases,
      selectedBox,
      selectedMode,
      totalCost,
      totalCaseCount,
    )
  };

  const copyLinkAction = () => {
    const battleLink = `https://crusade.gg/battles/${battleId}`;
    navigator.clipboard.writeText(battleLink)
      .then(() => {
        addToast("Successfully copied battle link!", { appearance: "success" });
      })
      .catch((error) => {
        addToast("Failed to copy battle link.", { appearance: "error" });
        console.error("Error copying text to clipboard:", error);
      });
  };

  // Button onClick event handler
  const provFairAction = () => {
    setModalVisible(state => !state);
  };

  const handleClick = async (i) => {
    if(i === 0) {
      setCallingBots(true);
      battlesSocket.emit("battles:callbot", battleId);
      setCallingBots(false);
    } else {
      setJoining(true);
      battlesSocket.emit("battles:join", battleId);
    }
  }
  
  const renderSpinnerBoxes = () => {
    let allBoxes = [];
    try {
      for(let i = 0; i < gameData.playerCount; i++) {
        let drops = [];
        for(let j = 0; j < gameData.cases.length; j++) {
          let filter2;
          try {
            filter2 = getFilterForItem(gameData?.casesRoundResults[j][i].item)
          } catch(e) {
          }
          drops.push(
            <div className={classes.drop} key={`drop-${i}-${j}`}>
              <div className={classes.blankDrop}>
                  { gameData?.casesRoundResults[j] ? (
                  <div className={classes.number} style={{display: "flex"}}>
                    <div className={classes.dropImg}>
                      <div className={classes.dropItem}>
                        <img style={{ filter: filter2 }} className={classes.dropActualImg} alt={gameData.casesRoundResults[j][i].item.name} src={gameData.casesRoundResults[j][i].item.image} draggable="false" decoding="async" data-nimg="fill" loading="lazy" />
                      </div>
                      <div className={classes.dropBackground}>
                        <div className={classes.backdropWrapper}
                         style={ gameData.casesRoundResults[j][i].item.color === "white" ? { filter: "drop-shadow(rgba(176, 195, 217, 1) 0px 0px 40px)", } 
                         : gameData.casesRoundResults[j][i].item.color === "lightblue" ? { filter: "drop-shadow(rgba(94, 152, 217, 1) 0px 0px 40px)", } 
                         : gameData.casesRoundResults[j][i].item.color === "blue" ? { filter: "drop-shadow(rgba(75, 105, 255, 1) 0px 0px 40px)", } 
                         : gameData.casesRoundResults[j][i].item.color === "purple" ? { filter: "drop-shadow(rgba(136, 71, 255, 1) 0px 0px 40px)", } 
                         : gameData.casesRoundResults[j][i].item.color === "pink" ? { filter: "drop-shadow(rgba(211, 46, 230, 1) 0px 0px 40px)", } 
                         : gameData.casesRoundResults[j][i].item.color === "red" ? { filter: "drop-shadow(rgba(228, 56, 56, 1) 0px 0px 40px)", } 
                         : { filter: "drop-shadow(rgb(255, 215, 0) 0px 0px 40px)", } }
                        >
                          <img className={classes.backdropImg} src={CheckItemColor(gameData.casesRoundResults[j][i].item.color)} alt="backdrop" decoding="async" data-nimg="1" loading="lazy" width="96" height="96" />
                        </div>
                      </div>
                    </div>
                    <div className={classes.dropText}>
                      <div className={classes.itemNameBox}>
                        <div className={classes.itemType}>
                        <span style={{color: "#ea580c"}}>{gameData.casesRoundResults[j][i].item.stattrack === "Yes" ? "StatTrak™" : ""}</span> {gameData.casesRoundResults[j][i].item.type}
                        </div>
                        <div className={classes.itemName}>
                          {gameData.casesRoundResults[j][i].item.name}
                        </div>
                      </div>
                      <div className={classes.dropPriceWrapper}>
                        <span>${parseCommasToThousands(parseFloat((gameData.casesRoundResults[j][i].item.price)))}</span>
                      </div>
                    </div>
                  </div>
                  ) : (
                  <div></div>
                  )}
              </div>
            </div>
          )
        }

        allBoxes.push(
          <div key={`spinner-${i}`} className={`${classes.spinnerCol} ${classes?.["spinner" + (i+1)]}`} style={{ width: `inherit ${100 / gameData.playerCount}%`}}>
            <div className={classes.rowTopDone}>
              <div className={classes.leftCol}>
                {gamePlayers[i] ? (
                  <div className={classes.profile}>
                    <div className={classes.picture}>
                      <img className={classes.profilePicture} src={gamePlayers[i].pfp} alt="profile pic" />
                    </div>
                    <div className={classes.text}>
                      <span className={classes.username}>{gamePlayers[i].username}</span>
                      <span className={classes.level} style={ gamePlayers[i].id === "bot1" || gamePlayers[i].id === "bot2" || gamePlayers[i].id === "bot3" ? {} : { background: gamePlayers[i].level.levelColor }}>{gamePlayers[i].id === "bot1" || gamePlayers[i].id === "bot2" || gamePlayers[i].id === "bot3" ? ("BOT") : (gamePlayers[i].level.name)}</span>
                    </div>
                  </div>
                ) : (
                  <div className={classes.profile}></div>
                )}
              </div>
              <div className={classes.rightCol}>
                {i === 0 && gameState === "waiting" ? (
                  <div className={classes.numberClick}>
                    <span 
                      className={callingBots || loading ? classes.disabled : classes.click} 
                      onClick={() => handleClick(i)}
                    >
                      {callingBots ? "Calling..." : "Call Bots"}
                    </span>
                  </div>
                ) : !gamePlayers[i] ? (
                  <div className={classes.numberClick}>
                    <span 
                      className={joining || loading ? classes.disabled : classes.click} 
                      onClick={() => handleClick(i)}
                    >
                      {joining ? "Joining..." : "Join"}
                    </span>
                  </div>
                ) : gameState !== "waiting" ? (
                  <div className={`${classes.balance} ${balanceData[i]?.isWinner ? classes.winner : ""}`}>
                    { balanceData[i]?.isWinner ? (
                      <svg className={classes.crownSvg} width="40" height="38" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g data-v-6b132742="" filter="url(#filter0_d_321:62)"><path data-v-6b132742="" d="M30 17.7616C30 16.6045 29.0586 15.6632 27.9015 15.6632C26.7445 15.6632 25.8031 16.6045 25.8031 17.7616C25.8031 18.288 25.9984 18.7693 26.3195 19.138L24.1503 21.128L21.3836 15.4105L23.0006 13.5112L20.0114 10L17.0222 13.5113L18.5672 15.326L15.8203 21.0955L13.6815 19.1369C14.0022 18.7683 14.197 18.2875 14.197 17.7616C14.197 16.6045 13.2556 15.6632 12.0985 15.6632C10.9414 15.6632 10 16.6045 10 17.7616C10 18.8338 10.8086 19.7203 11.848 19.8446L12.491 27.5478H27.5091L28.1521 19.8446C29.1914 19.7203 30 18.8338 30 17.7616Z" fill="#4EA24D"></path></g><defs data-v-6b132742=""><filter data-v-6b132742="" id="filter0_d_321:62" x="0" y="0" width="40" height="37.5479" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood data-v-6b132742="" floodOpacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix data-v-6b132742="" in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset data-v-6b132742=""></feOffset><feGaussianBlur data-v-6b132742="" stdDeviation="5"></feGaussianBlur><feComposite data-v-6b132742="" in2="hardAlpha" operator="out"></feComposite><feColorMatrix data-v-6b132742="" type="matrix" values="0 0 0 0 0.305882 0 0 0 0 0.635294 0 0 0 0 0.301961 0 0 0 0.35 0"></feColorMatrix><feBlend data-v-6b132742="" mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_321:62"></feBlend><feBlend data-v-6b132742="" mode="normal" in="SourceGraphic" in2="effect1_dropShadow_321:62" result="shape"></feBlend></filter></defs></svg>
                    ) : (
                      ""
                    )
                    }
                    <span className={classes.wrap}>
                      <div className={classes.priceWrapper}>
                      </div>
                      <span className={classes.count}>${parseCommasToThousands(parseFloat((balanceData[i]?.balance)?.toFixed(2)))}</span>
                    </span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className={classes.middle} style={{ alignContent: gameState !== "finished" ? "center" : ""}}>
              <canvas id={`canvas-${i}`} className={classes.canvas}></canvas>
              <div className={classes.finishedGradient} orientation="vertical" />
              { gameState !== "finished" ? (
                <div id="door" className={classes.door}>
                  <div id="boxes" className={classes.boxes}>

                  </div>
                </div>
              ) : ""}
              { balanceData[i]?.isWinner && gameState === "finished" ? (
                <div className={classes.winTextContainer}>
                  <span className={classes.winnerText}>Winner</span>
                  <div className={classes.priceCont}>
                    <div className={classes.priceCont2}>
                      <span>
                      <CountUp
                      delay={0}
                      duration={0.8}
                      decimals={2}
                      prefix={"$ "}
                      start={0}
                      end={balanceData[i]?.amountWon}
                      />
                      </span>
                    </div>
                  </div>
                  {/*triggerConfetti(i)*/}
                </div>
              ) : gameState === "finished" ? (
                <div className={classes.lossTextContainer}>
                  <span className={classes.lossText}>Loss</span>
                  <div className={classes.priceCont}>
                    <div className={classes.priceCont2}>
                      <span>$0.00</span>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className={classes.bottom}>
              <div className={classes.rowDrops}>
                {drops}
              </div>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.log(error)
    }
    return allBoxes;
  }

  const renderCaseBoxes = () => {
    let allBoxes = [];

    try {
      for(let i = 0; i < gameCases.length; i++) {
        allBoxes.push(
          <div key={`case-${i}`} className={`${classes.case} ${roundNum === i+1 ? classes.active : ""}`}>
            <img className={`${classes.inactiveImg} ${roundNum === i+1 ? classes.activeImg : ""}`} src={gameCases[i].image} alt="Case" />
          </div>
        );
      }
    } catch (error) {
      console.log(error)
    }
    return allBoxes;
  }

  const spinnerBoxes = renderSpinnerBoxes();
  const cases = renderCaseBoxes();

  return (
    <div className={classes.root}> 
      <div className={classes.battle}>
        <div className={classes.rowTop}>
          <div className={classes.topLeftCol}>
            <div style={{cursor: "pointer"}} onClick={() => history.push(`/battles/`)}>
              <div className={classes.backButton}>Back</div>
            </div>
            {
              gameState === 'waiting' && gamePlayers.length === 1 ? (
                <div style={{cursor: "pointer"}} onClick={() => { cancelBattle() }}>
                  <div className={classes.cancelButton}>Cancel</div>
                </div>
              ) : null
            }
            <span className={classes.price}>
              <div className={classes.priceWrapper}>
                ${parseFloat(gameData.price).toFixed(2)}
              </div>
            </span>
          </div>
          <div className={classes.topMiddleCol}>
            <span className={classes.caseButton}>
            {gameState === "waiting" ? <span className={classes.noGames}>
            <p style={{marginBottom: "-15px", marginTop: "10px", }}>Waiting for player</p>
            </span> : gameState === "finished" ? <span>
            <p>Game has finished.</p>
            </span> : gameState === "countdown" ? " " : gameCases[roundNum-1]?.name}</span>
            <br/>
            <span className={classes.price}>
            <div className={classes.priceWrapper}>
              {gameState === "waiting" || gameState === "finished" || gameState === "countdown" ? "" : gameState === "spinning" ? 
                (typeof gameCases[roundNum - 1]?.price === 'number' ? "$" + parseCommasToThousands(parseFloat(gameCases[roundNum - 1]?.price).toFixed(2)) : "Loading...") 
                : null}
            </div>
          </span>
          </div>
          <div className={classes.topRightCol}>
            <div className={classes.battleInfo}>
              <div>{gameData.gameType === 1 ? "1 vs 1" : gameData.gameType === 2 ? "1 vs 1 vs 1" : gameData.gameType === 3 ? "1 vs 1 vs 1 vs 1" : gameData.gameType === 4 ? "2 vs 2" : 0}</div>
              <div style={{ fontWeight: 500, fontSize: 16, color: gameData.isCrazyMode ? "#178ac9" : "#999" }}>{gameData.isCrazyMode ? "Crazy" : "Normal" }</div>
            </div>
            <div className={classes.link} onClick={() => copyLinkAction()}>
              <svg className={classes.linkSvg} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-6b132742="" d="M8.85996 6.19338L6.19329 8.86004C6.13081 8.92202 6.08121 8.99575 6.04737 9.07699C6.01352 9.15823 5.99609 9.24537 5.99609 9.33338C5.99609 9.42138 6.01352 9.50852 6.04737 9.58976C6.08121 9.671 6.13081 9.74473 6.19329 9.80671C6.25527 9.86919 6.329 9.91879 6.41024 9.95264C6.49148 9.98648 6.57862 10.0039 6.66663 10.0039C6.75463 10.0039 6.84177 9.98648 6.92301 9.95264C7.00425 9.91879 7.07798 9.86919 7.13996 9.80671L9.80663 7.14004C9.93216 7.01451 10.0027 6.84424 10.0027 6.66671C10.0027 6.48917 9.93216 6.31891 9.80663 6.19338C9.68109 6.06784 9.51083 5.99731 9.33329 5.99731C9.15576 5.99731 8.9855 6.06784 8.85996 6.19338Z" fill="#EFFAFB"></path><path data-v-6b132742="" d="M8.18669 11.6L7.33335 12.4467C6.8543 12.9403 6.21031 13.2403 5.52421 13.2895C4.83811 13.3387 4.15791 13.1336 3.61335 12.7134C3.32553 12.4762 3.09066 12.1813 2.92391 11.8477C2.75716 11.5141 2.66224 11.1492 2.64528 10.7767C2.62831 10.4041 2.68969 10.0321 2.82543 9.68478C2.96118 9.33742 3.16828 9.02239 3.43335 8.76004L4.38002 7.80671C4.44251 7.74473 4.4921 7.671 4.52595 7.58976C4.55979 7.50852 4.57722 7.42138 4.57722 7.33337C4.57722 7.24537 4.55979 7.15823 4.52595 7.07699C4.4921 6.99575 4.44251 6.92202 4.38002 6.86004C4.31805 6.79756 4.24431 6.74796 4.16307 6.71411C4.08183 6.68027 3.9947 6.66284 3.90669 6.66284C3.81868 6.66284 3.73154 6.68027 3.6503 6.71411C3.56906 6.74796 3.49533 6.79756 3.43335 6.86004L2.58669 7.71337C1.87346 8.40404 1.43508 9.33006 1.35293 10.3195C1.27079 11.3089 1.55046 12.2945 2.14002 13.0934C2.48994 13.5473 2.93245 13.9216 3.43815 14.1914C3.94385 14.4612 4.50116 14.6203 5.07307 14.6581C5.64499 14.6959 6.2184 14.6117 6.75523 14.4108C7.29206 14.21 7.78002 13.8973 8.18669 13.4934L9.13335 12.5467C9.25889 12.4212 9.32941 12.2509 9.32941 12.0734C9.32941 11.8958 9.25889 11.7256 9.13335 11.6C9.00782 11.4745 8.83755 11.404 8.66002 11.404C8.48249 11.404 8.31222 11.4745 8.18669 11.6Z" fill="#EFFAFB"></path><path data-v-6b132742="" d="M13.1067 2.14677C12.3024 1.55108 11.3087 1.26856 10.3113 1.35199C9.31388 1.43541 8.38094 1.87908 7.68674 2.60011L6.96674 3.33344C6.88444 3.39326 6.81563 3.4697 6.76475 3.55781C6.71387 3.64592 6.68206 3.74372 6.67138 3.8449C6.66069 3.94608 6.67137 4.04838 6.70273 4.14517C6.73409 4.24195 6.78542 4.33108 6.8534 4.40677C6.91538 4.46926 6.98911 4.51885 7.07035 4.5527C7.15159 4.58655 7.23873 4.60397 7.32674 4.60397C7.41475 4.60397 7.50188 4.58655 7.58312 4.5527C7.66436 4.51885 7.7381 4.46926 7.80007 4.40677L8.66674 3.53344C9.14314 3.03765 9.78637 2.736 10.4722 2.68675C11.158 2.6375 11.8377 2.84414 12.3801 3.26677C12.67 3.50397 12.9068 3.79961 13.0748 4.13442C13.2429 4.46922 13.3386 4.83568 13.3555 5.20993C13.3725 5.58417 13.3105 5.95778 13.1734 6.30644C13.0363 6.65509 12.8274 6.97095 12.5601 7.23344L11.6134 8.18677C11.5509 8.24875 11.5013 8.32248 11.4675 8.40372C11.4336 8.48496 11.4162 8.5721 11.4162 8.66011C11.4162 8.74811 11.4336 8.83525 11.4675 8.91649C11.5013 8.99773 11.5509 9.07146 11.6134 9.13344C11.6754 9.19593 11.7491 9.24552 11.8304 9.27937C11.9116 9.31321 11.9987 9.33064 12.0867 9.33064C12.1747 9.33064 12.2619 9.31321 12.3431 9.27937C12.4244 9.24552 12.4981 9.19593 12.5601 9.13344L13.5067 8.18677C13.9095 7.78018 14.2213 7.29264 14.4214 6.75647C14.6216 6.22029 14.7055 5.64771 14.6677 5.07664C14.6299 4.50558 14.4712 3.94907 14.2021 3.44397C13.933 2.93887 13.5596 2.49671 13.1067 2.14677Z" fill="#EFFAFB"></path></svg>
            </div>
          </div>
        </div>
        <div className={classes.rowCases}>
          <div className={classes.middleLeftCol}>
            <span>
              Round <span style={{ color: "#fff",}}>{roundNum} <span style={{ color: "#ccc",}}>of</span> {gameData?.cases?.length}</span>
            </span>
          </div>
          {gameState !== "finished" ? (
          <div className={classes.middleMiddleCol}>
            <div className={classes.inner}>
              {/*<div className={classes.left}></div>
              <div className={classes.right}></div>*/}
              <div className={classes.caselist} style={{ transform: `translateX(${itemMoveLeft}px) translateZ(0px)`, }}>
                {cases}
              </div>
            </div>
          </div>
          ) : (
          <div className={classes.middleCol}>
            <div style={{cursor: "pointer"}} onClick={() => handleCreateBattle()}>
              <div className={classes.createNewBattle}>Recreate Battle</div>
            </div>
          </div>
          )}
            <ProvablyModal
              fairDataID={gameData.id}
              fairDataHash={battleHash}
              fairDataPrivateSeed={battlePrivateSeed}
              fairDataPublicSeed={battlePublicSeed}
              open={modalVisible}
              handleClose={() => setModalVisible(state => !state)}
            />
          <div className={classes.middleProvablyFairCol}>
            <div style={{display: "grid",textAlign: "right", cursor: "pointer",}} onClick={() => provFairAction()}>
              <svg className={classes.provFairSvg} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-6b132742="" d="M7 0C3.13409 0 0 3.13409 0 7C0 10.8659 3.13409 14 7 14C10.8659 14 14 10.8659 14 7C14 3.13409 10.8659 0 7 0ZM12.8044 6.41668H11.0417C10.7859 4.62831 9.37169 3.21412 7.58332 2.95832V1.19563C10.3391 1.46929 12.5307 3.66086 12.8044 6.41668ZM9.33332 7.58332H9.85827C9.62631 8.72624 8.72624 9.62634 7.58332 9.85827V9.33332C7.58332 9.01116 7.32216 8.75 7 8.75C6.67784 8.75 6.41668 9.01116 6.41668 9.33332V9.85827C5.27376 9.62631 4.37366 8.72624 4.14173 7.58332H4.66668C4.98884 7.58332 5.25 7.32216 5.25 7C5.25 6.67784 4.98884 6.41668 4.66668 6.41668H4.14173C4.37369 5.27376 5.27376 4.37366 6.41668 4.14173V4.66668C6.41668 4.98884 6.67784 5.25 7 5.25C7.32216 5.25 7.58332 4.98884 7.58332 4.66668V4.14173C8.72624 4.37369 9.62634 5.27376 9.85827 6.41668H9.33332C9.01116 6.41668 8.75 6.67784 8.75 7C8.75 7.32216 9.01116 7.58332 9.33332 7.58332ZM6.41668 1.19563V2.95832C4.62831 3.21412 3.21412 4.62831 2.95832 6.41668H1.19563C1.46929 3.66086 3.66086 1.46929 6.41668 1.19563ZM1.19563 7.58332H2.95832C3.21412 9.37169 4.62831 10.7859 6.41668 11.0417V12.8044C3.66086 12.5307 1.46929 10.3391 1.19563 7.58332ZM7.58332 12.8044V11.0417C9.37169 10.7859 10.7859 9.37169 11.0417 7.58332H12.8044C12.5307 10.3391 10.3391 12.5307 7.58332 12.8044Z" fill="#EFFAFB" fillOpacity="0.5"></path></svg>
              <span style={{gridRow: 1,gridColumn: 1,margin: "auto 0"}}>Provably Fair</span>
            </div>
          </div>
        </div>
        <div className={classes.rowSpinners} style={{gridTemplateColumns: `repeat(${gameData?.playerCount}, 1fr)`}}>
        {gameState === "countdown" ? (
            <div className={classes.countdown}>
              <div className={classes.countdownText}>Starting in..</div>
              <div className={classes.countdownNum}>{countNum}</div>
            </div>
          ) : (
            <div></div>
          )}
          {gameState !== "finished" ? (
          <div className={classes.spinnerLeft}>
            <svg style={{ fill: "#178ac9", margin: "auto 0" }} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-6b132742="" d="M10.3639 9.31795C10.7221 9.70208 10.7221 10.2979 10.3639 10.682L2.23131 19.402C1.61214 20.0659 0.5 19.6277 0.5 18.7199L0.5 1.28006C0.5 0.372261 1.61214 -0.0658662 2.23131 0.598015L10.3639 9.31795Z"></path></svg>
          </div>
          ) : "" }
          {gameState !== "finished" ? (
          <div style={{ gridColumn: gameData?.playerCount }} className={classes.spinnerRight}>
            <svg style={{ fill: "#178ac9", margin: "auto 0", marginLeft: "auto" }} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-6b132742="" d="M0.636108 9.31795C0.277851 9.70208 0.27785 10.2979 0.636107 10.682L8.76869 19.402C9.38786 20.0659 10.5 19.6277 10.5 18.7199L10.5 1.28006C10.5 0.372261 9.38786 -0.0658662 8.76869 0.598015L0.636108 9.31795Z"></path></svg>
          </div>
          ) : "" }
          {spinnerBoxes}
        </div>
      </div>
    </div>
  );
};

export default BattlePage;