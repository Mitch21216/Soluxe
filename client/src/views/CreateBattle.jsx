import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import ExIcon from "@material-ui/icons/Close";
import { useToasts } from "react-toast-notifications";
import { getActiveCases } from "../services/api.service";
import { battlesSocket } from "../services/websocket.service";
import FormControl from "@material-ui/core/FormControl";
import Dialog from '@material-ui/core/Dialog';

import CaseItemModal from "../components/battles/CaseItemModal";

import placebet from "../assets/placebet.wav";
import error from "../assets/error.wav";

const errorAudio = new Audio(error);
const placebetAudio = new Audio(placebet);

const playSound = audioFile => {
  audioFile.play();
};

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    width: "90%",
    margin: "0 5%",
    paddingTop: 25,
    paddingBottom: 120,
    [theme.breakpoints.down("xs")]: {
      paddingTop: "1px",
    },
    [theme.breakpoints.down("sm")]: {
      paddingTop: "1px",
    },
  },
  container: {
    maxWidth: 1500,
  },
  topRow: {
    marginTop: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      display: "inherit",
    },
    [theme.breakpoints.down("sm")]: {
      display: "inherit",
    },
  },
  cancelButton: {
    textTransform: "none",
    height: "50px",
    display: "flex",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 18,
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    color: "#effafb",
    border: "1px solid #12171d",
    background: "linear-gradient(0deg,#12171D,#12171D),#12171D",
    fontFamily: "Rubik",
    "&:hover": {
      border: "1px solid #12171d",
    }
  },
  roundsBox: {
    width: "128px",
    height: "48px",
    display: "flex",
    border: "1px dashed #147ab2",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: "12px",
    marginLeft: "12px",
    padding: "0 20px",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    color: "rgba(239,250,251,.5)",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "0px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "0px",
    },
  },
  roundsBox2: {
    width: "128px",
    height: "48px",
    display: "flex",
    border: "1px dashed #147ab2",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: "12px",
    marginLeft: "12px",
    padding: "0 20px",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    color: "rgba(239,250,251,.5)",
    background: "#12171D",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "-17px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "-17px",
    },
  },
  totalCostBox: {
    height: "48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: "16px",
    padding: "0 23px",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    color: "rgba(239,250,251,.5)",
    border: "1px dashed #147ab2",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "15px",
    },
  },
  priceWrapper: {
    marginLeft: "13px",
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF !important",
  },
  createBattleButton: {
    textTransform: "none",
    height: "48px",
    padding: "0 30px",
    borderRadius: "4px",
    fontSize: "15px",
    color:" #fff",
    background: "#178ac9",
    border: "none",
    transition: "opacity .3s ease",
    fontFamily: "Rubik",
    "&:hover": {
      opacity: 0.8,
      background: "#178ac9"
    },
    [theme.breakpoints.down("xs")]: {
      marginTop: "15px",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "15px",
    },
  },
  disabled: {  
    cursor: "not-allowed",
    opacity: .25,
  },
  battleCreatorControl: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    width: "100%",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "2px dashed #12171D",
    borderBottom: "2px dashed #12171D",
    fontFamily: "Rubik",
  },
  battleControlSettings: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: "18px",
    fontFamily: "Rubik",
  },
  battleCreatorType: {
    width: "153px",
    position: "relative",
    zIndex: 6,
    fontFamily: "Rubik",
    "& .button-toggle": {
      width: "100%",
      height: "48px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 11px 0 20px",
      borderRadius: "4px",
      fontSize: "15px",
      fontWeight: "500",
      color: "#effafb",
      background: "#12171D",
      border: "none",
      fontFamily: "Rubik",
    },
    "& .type-menu": {
      width: "100%",
      height: 0,
      position: "absolute",
      top: "53px",
      left: 0,
      overflow: "hidden",
      transition: "height .3s ease",
      "& .menu-inner": {
        width: "100%",
        padding: "3px",
        borderRadius: "5px",
        background: "#2a2a38",
        fontFamily: "Rubik",
        "& .item": {
          width: "100%",
          height: "30px",
          display: "flex",
          alignItems: "center",
          padding: "20px",
          borderRadius: "4px",
          fontSize: "15px",
          fontWeight: 600,
          color: "rgba(239,250,251,.5)",
          background: "0 0",
          border: "none",
          transition: "background .3s ease",
          fontFamily: "Rubik",
        },
      },
    },
  },
  boxContainer: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      marginTop: "20px",
      display: "inherit",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "20px",
      display: "inherit",
    },
  },
  darkBox: {

    [theme.breakpoints.down("xs")]: {
      marginTop: "15px",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "15px",
    },
  },
  box: {
    backgroundColor: "#323232",
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    display: "inline-block",
    marginRight: theme.spacing(2),
    fontFamily: "Rubik",
  },
  addCaseContainer: {
    display: "flex",
    alignItems: "center",
  },
  buttonAdd: {
    //background: "linear-gradient(225deg,rgba(99,88,55,0) 50%,rgba(99,88,55,.56)),rgba(56,53,42,.6901960784313725)",
    height: "300px",
    display: "flex !important",
    flexDirection: "column",
    cursor: "pointer",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 500,
    color: "#effafb",
    background: "linear-gradient(225deg,#1C2344 30%,#12171D),#2a2a38",
    border: "none",
    boxShadow: "0 2px 16px rgba(0,0,0,.1)",
    fontFamily: "Rubik",
    transition: "all .3s ease",
    "&:hover": {
      transform: "scale(1.03)",
    },
    "@media (max-width: 1300px)": {
      flexBasis: "calc(33.33% - 9.6px)",
    },
    "@media (max-width: 1500px)": {
        flexBasis: "calc(95% - 9px)",
    },
  },
  addIcon: {
    width: "54px",
    height: "54px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "27px",
    borderRadius: "4px",
    WebkitTransform: "rotate(45deg)",
    transform: "rotate(45deg)",
    background: "linear-gradient(225deg,rgba(77,55,99,0) 50%,rgba(77,55,99,.56)),hsla(0,0%,100%,.08)",
    boxShadow: "0 2px 16px rgba(0,0,0,.24)",
    boxSizing: "border-box",
  },
  creatorList: {
    width: "100%",
    marginTop: "32px",
    display: "grid",
    gridGap: '12px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    fontFamily: "Rubik",
  },
  leftMode: {
    width: "100%",
    display: "flex",
    marginTop: "12px",
    marginLeft: 0,
    paddingLeft: 0,
    fontFamily: "Rubik",
    "&::before": {
      content: "",
      width: "2px",
      height: "24px",
      position: "absolute",
      top: "50%",
      left: 0,
      WebkitTransform: "translateY(-50%)",
      transform: "translateY(-50%)",
      background: "#12171D",
    },
  },
  button: {  
    textTransform: "none",
    width: "100px",
    height: "48px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "8px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: 500,
    color: "rgba(239,250,251,.72)",
    background: "#12171D",
    //border: "2px solid #2a2a38",
    transition: "all .3s ease",
    fontFamily: "Rubik",
  },
  selected: {
    color: "#effafb",
    background: "#2a2a38",
    border: "2px solid #178ac9 !important",
  },
  selectedCrazy: {
    color: "#FF5353",
    background: "#2a2a38",
    border: "2px solid #FF5353 !important",
  },
  modalContent: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    pointerEvents: "auto",
    backgroundColor: "#12171D",
    //backgroundClip: "padding-box",
    borderRadius: "4px",
    outline: 0,
    fontFamily: "Rubik",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "1rem",
    borderTopLeftRadius: "calc(.3rem - 1px)",
    borderTopRightRadius: "calc(.3rem - 1px)",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      display: "inline",
    },
    [theme.breakpoints.down("sm")]: {
      display: "inline",
    },
  },
  headerTitle: {
    marginRight: 0,
    fontSize: "20px",
    fontWeight: 600,
    fontFamily: "Rubik",
    color: "#effafb",
  },
  modalBody: {
    padding: "1.5rem !important",
    background: "#0D1116 !important",
    borderLeft: "20px solid #12171D !important",
    borderRight: "20px solid #12171D !important",
    borderBottom: "20px solid #12171D !important",
    position: "relative",
    flex: "1 1 auto",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      padding: "1rem !important",
      marginBottom: "4px",
      borderLeft: "6px solid #12171D !important",
      borderRight: "6px solid #12171D !important",
      borderBottom: "6px solid #12171D !important",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "1rem !important",
      marginBottom: "4px",
      borderLeft: "6px solid #12171D !important",
      borderRight: "6px solid #12171D !important",
      borderBottom: "6px solid #12171D !important",
    },
  },
  inputSearch: {
    width: "100%",
    height: "56px",
    padding: "0 15px 0 49px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: 500,
    fontFamily: "Rubik",
    color: "#effafb",
    background: "#12171D",
    border: "1px solid #2a2a38",
    outline: "none",
    marginRight: "1rem"
  },
  searchSvg: {
    position: "absolute",
    top: "7.9%",
    left: "30px",
    "-webkit-transform": "translateY(-50%)",
    transform: "translateY(-50%)",
    fill: "rgba(239,250,251,.2)",
    fontFamily: "Rubik",
    [theme.breakpoints.down("xs")]: {
      top: "4.9%",
    },
    [theme.breakpoints.down("sm")]: {
      top: "4.9%",
    },
  },
  modalFilter: {
    display: "flex",
    alignItems: "center",
    fontFamily: "Rubik",
    boxSizing: "border-box",
    [theme.breakpoints.down("xs")]: {
      display: "inherit",
    },
    [theme.breakpoints.down("sm")]: {
      display: "inherit",
    },
  },
  priceminmax: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      marginTop: "10px",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      marginTop: "10px",
    },
  },
  priceminmaxText: {
    marginLeft: "1.7rem",
    [theme.breakpoints.down("xs")]: {
      marginTop: "15px",
      marginRight: "5px",
      marginLeft: "0.5rem",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "15px",
      marginRight: "5px",
      marginLeft: "0.5rem",
    },
  },
  buttonToggle: {
    width: "100%",
    height: "48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 11px 0 20px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "Rubik",
    color: "#effafb",
    background: "#2a2a38",
    border: "none",
  },
  modalList: {
    width: "100%",
    height: "550px",
    [theme.breakpoints.down("xs")]: {
      height: "auto",
      overflowY: "inherit",
    },
    [theme.breakpoints.down("sm")]: {
      height: "auto",
      overflowY: "inherit",
    },
    display: "grid",
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gridGap: '12px',
    marginTop: "16px",
    padding: "2px",
    fontFamily: "Rubik",
    overflowY: "scroll",
  },
  battleCreatorCase: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily: "Rubik",
    padding: "8px 18px 12px",
    borderRadius: "8px",
    background: "#12171D",
    boxShadow: "0 2px 16px rgba(0,0,0,.1)",
    transition: "all .3s ease",
  },
  caseImage: {
    width: "100%",
    height: "170px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Rubik",
  },
  caseName: {
    height: "40px",
    marginTop: "4px",
    textAlign: "center",
    fontSize: "15px",
    fontFamily: "Rubik",
    fontWeight: 500,
    color: "#effafb",
  },
  casePrice: {
    height: "38px",
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    fontFamily: "Rubik",
    padding: "0 16px",
    borderRadius: "4px",
    background: "linear-gradient(225deg,rgba(77,55,99,0) 50%,rgba(77,55,99,.56)),hsla(0,0%,100%,.04)",
    boxShadow: "0 2px 16px rgba(0,0,0,.24)",
  },
  casePriceWrapper: {
    fontSize: "15px",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "baseline",
    color: "#eee !important",
  },
  priceWarpperImage: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    height: "1rem",
    width: "1rem",
    marginRight: "6px",
  },
  addCaseButton: {
    textTransform: "none",
    width: "100%",
    height: "46px",
    borderRadius: "4px",
    fontSize: "15px",
    color: "#fff",
    fontFamily: "Rubik",
    background: "#178ac9",
    border: "none",
    outline: "none",
    transition: "all .3s ease",
    marginTop: '8px',
    "&:hover": {
      background: "#178ac9",
      transform: "scale(1.02)"
    }
  },
  selectedCase: {
    background: "linear-gradient(225deg,#12171D 30%,#1C2344),#2a2a38",
    boxShadow: "0 0 16px rgba(0,0,0,.24),0 0 0 1px #178ac9",
  },
  caseCount: {
    width: "100%",
    marginTop: "8px",
    padding: "0 10px",
  },
  countInner: {
    width: "100%",
    height: "46px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#effafb",
    background: "#0D1116",
    boxShadow: "inset 0 0 12px rgba(0,0,0,.48)",
    zIndex: 1,
    "&::before": {
      
    }
  },
  countInnerBefore:{
    content: "",
    width: "35px",
    height: "35px",
    position: "absolute",
    top: "50%",
    "-webkit-transform": "translateY(-51%) rotate(45deg)",
    transform: "translateY(-51%) rotate(45deg)",
    borderRadius: "5px",
    background: "#0D1116",
    zIndex: -1,
    left: "-13.5px",
    boxShadow: "inset 7px 0 12px -7px rgba(0,0,0,.48),inset 0 -7px 12px -7px rgba(0,0,0,.48)",
  },
  countInnerAfter: {
    content: "",
    width: "35px",
    height: "35px",
    position: "absolute",
    top: "50%",
    "-webkit-transform": "translateY(-51%) rotate(45deg)",
    transform: "translateY(-51%) rotate(45deg)",
    borderRadius: "5px",
    background: "#0D1116",
    zIndex: -1,
    right: "-13.5px",
    boxShadow: "inset 0 7px 12px -7px rgba(0,0,0,.48),inset -7px 0 12px -7px rgba(0,0,0,.48)",
  },
  buttonDecrease: {
    cursor: "pointer",
    left: "-8.5px",
    width: "25px",
    height: "25px",
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    "-webkit-transform": "translateY(-50%) rotate(45deg)",
    transform: "translateY(-50%) rotate(45deg)",
    borderRadius: "5px",
    background: "#23242c",
    border: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,.48)",
    userSelect: 'none',
  },
  buttonIncrease: {
    cursor: "pointer",
    right: "-8.5px",
    width: "25px",
    height: "25px",
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    "-webkit-transform": "translateY(-50%) rotate(45deg)",
    transform: "translateY(-50%) rotate(45deg)",
    borderRadius: "5px",
    background: "#23242c",
    border: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,.48)",
    userSelect: 'none',
  },
  popup: {
    maWidth: "800px",
    "@media (max-width: 1300px)": {
      flexBasis: "calc(33.33% - 9.6px)",
    },
  },
  paper: {
    width: "50%",
    maxWidth: "50%",
    background: "#12171d",
    [theme.breakpoints.down("xs")]: {
      width: "95%",
      maxWidth: "95%",
      margin: "15px",
      overflowY: "scroll",
      maxHeight: "79%",
      marginTop: "83px",
      "&::-webkit-scrollbar": {
        width: "0px",
        height: "7px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#798183",
        borderRadius: "0px",
      },
      "&::-webkit-scrollbar-track": {
        borderRadius: "0px",
        background: "#1b2129",
      },
    },
    [theme.breakpoints.down("sm")]: {
      width: "95%",
      maxWidth: "95%",
      margin: "15px",
      overflowY: "scroll",
      maxHeight: "79%",
      marginTop: "83px",
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "0px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#798183",
        borderRadius: "0px",
      },
      "&::-webkit-scrollbar-track": {
        borderRadius: "0px",
        background: "#1b2129",
      },
    },
    [theme.breakpoints.down("md")]: {
      width: "95%",
      maxWidth: "95%",
      margin: "15px",
      overflowY: "scroll",
      maxHeight: "79%",
      marginTop: "83px",
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "0px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#798183",
        borderRadius: "0px",
      },
      "&::-webkit-scrollbar-track": {
        borderRadius: "0px",
        background: "#1b2129",
      },
    },
  },
  linkBox: {
    borderWidth: "1px",
    borderColor: "transparent",
    letterSpacing: "0.05em",
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    height: "1.5rem",
    width: "1.5rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.25rem",
    fontSize: "0.8rem",
    lineHeight: "1.75rem",
    cursor: "pointer",
    "&:hover": {
      opacity: 0.8
    },
    "&:active": {
      opacity: 0.6
    }
  }
}));

const CreateBattle = ({ user, isAuthenticated }) => {
  const classes = useStyles();
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(true);
  const [availableCases, setAvailableCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);
  const [totalCaseCount, setTotalCaseCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedMode, setSelectedMode] = useState("1v1");
  const [selectedBox, setSelectedBox] = useState("standard");
  const [addCasesDialogOpen, setAddCasesDialogOpen] = useState(false);
  const [sortType, setSortType] = useState("highest");
  const [searchInputState, setSearchInputState] = useState("");
  const [openCaseItemModal, setOpenCaseItemModal] = useState(false);
  const [SelectedCaseItems, setSelectedCaseItems] = useState("");
  const [SelectedCaseName, setSelectedCaseName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const cases = await getActiveCases();
      setAvailableCases(cases);      
      setLoading(false)
    } catch (error) {
      console.log("There was an error while loading active case data:", error);
    }
  };

  const history = useHistory();

    // Button onClick load case items
    const onClickCaseItems = (item) => {
      setOpenCaseItemModal(true);
      setSelectedCaseItems(item.items);
      setSelectedCaseName(item.name);
    };

  useEffect(() => {
    fetchData();

    const error = msg => {
      addToast(msg, { appearance: "error" });
      playSound(errorAudio);
    };

    const success = msg => {
      addToast(msg, { appearance: "success" });
    };

    const fwd = (battleId) => {
      playSound(placebetAudio);
      setTimeout(() => {
      history.push(`/battles/${battleId}`);
    }, 300)
    }
    
    battlesSocket.on("battles:error", error);
    battlesSocket.on("battles:success", success);
    battlesSocket.on("battles:created", fwd);

    return () => {
      battlesSocket.off("battles:error", error);
      battlesSocket.off("battles:success", success);
      battlesSocket.off("battles:created", fwd);
    };
  }, [addToast, history]);

  const handleCreateBattle = () => {
    const caseSlugs = selectedCases.map(c => c.slug)

    battlesSocket.emit(
      "battles:create",
      caseSlugs,
      selectedBox,
      selectedMode,
      totalCost,
      totalCaseCount,
    )
  };

  const handleModeChange = event => {
    setSelectedMode(event.target.value);
  };

  const handleClick = async (item) => {
    let newarr = selectedCases;
    newarr.push(item);
    newarr.sort((a, b) => a.price - b.price)
    setSelectedCases(newarr);
    setTotalCaseCount(totalCaseCount+1);
    setTotalCost(parseFloat((totalCost).toFixed(2))+parseFloat((item.price).toFixed(2)));
  };

  const handleRemoveOne = async (item) => {
    const arr = selectedCases;
    const index = selectedCases.findIndex(obj => obj.slug === item.slug);
    if (index !== -1) {
      arr.splice(index, 1);
    }
    setSelectedCases(arr);
    setTotalCaseCount(totalCaseCount-1);
    setTotalCost(parseFloat((totalCost).toFixed(2))-parseFloat((item.price).toFixed(2)));
  };

  const handleAddOne = async (item) => {
    let newarr = selectedCases;
    newarr.push(item);
    newarr.sort((a, b) => a.price - b.price);
    setSelectedCases(newarr);
    setTotalCaseCount(totalCaseCount+1);
    setTotalCost(parseFloat((totalCost).toFixed(2))+parseFloat((item.price).toFixed(2)));
  };

  const handleSearchInputChange = event => {
    setSearchInputState(event.target.value);
  };

  const renderCaseOptions = () => {
    let sortedCases = [...availableCases]; 

    const searchInput = searchInputState; 
    const filteredCases = sortedCases.filter(item =>
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (sortType === "highest") {
      filteredCases.sort((a, b) => b.price - a.price);
    } else if (sortType === "lowest") {
      filteredCases.sort((a, b) => a.price - b.price);
    }

    let allBoxes = [];
    try {
      allBoxes.push(
        filteredCases.map((item, i) => (
          <div className={`${classes.battleCreatorCase} ${selectedCases.find(e => e.slug === item.slug) ? classes.selectedCase : ""}`} key={item.id} >
              <div className={classes.linkBox} style={{ cursor: "pointer", }} onClick={() => onClickCaseItems(item)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: "rgb(23 138 201)", }} xmlns="http://www.w3.org/2000/svg"><path id="icon" fillRule="evenodd" clipRule="evenodd" d="M3.33335 5.46667V8.21667L1.25002 8.08333L0.833352 0H2.50002L3.33335 1.64167H7.50002L8.33335 0H11.6667L12.5 1.64167H16.6667L17.5 0H19.1667L18.75 8.08333L16.6667 8.21667V5.46667C16.6667 5.125 16.3834 4.84167 16.0417 4.84167H12.5L11.6667 6.025H8.33335L7.50002 4.84167H3.95835C3.61668 4.84167 3.33335 5.125 3.33335 5.46667ZM20 9.37499V10.7917C20 11.273 19.4395 11.7054 19.0509 12.0052C19.0157 12.0323 18.9818 12.0584 18.95 12.0833L19.925 19.1C19.9667 19.5833 19.5833 20 19.0917 20H17.4L16.375 19.0583L12.3333 20H7.66667L3.625 19.0583L2.6 20H0.908333C0.416667 20 0.0333333 19.5833 0.075 19.1L1.05 12.0917C1.01168 12.0608 0.970537 12.0284 0.927508 11.9946C0.540054 11.6894 0 11.2642 0 10.7917V9.37499L6.66667 9.58332V9.12499H6.675C6.7 8.68332 7.05833 8.33332 7.5 8.33332H12.5C12.9417 8.33332 13.3 8.68332 13.325 9.12499H13.3333V9.58332L20 9.37499ZM8.33333 9.58332C8.10833 9.58332 7.91667 9.76666 7.91667 9.99999V13.1417C7.91667 13.3 8.00833 13.4417 8.15 13.5083L9.69167 14.2833C9.88333 14.3833 10.1167 14.3833 10.3083 14.2833L11.85 13.5083C11.9917 13.4417 12.0833 13.3 12.0833 13.1417V9.99999C12.0833 9.77499 11.9 9.58332 11.6667 9.58332H8.33333ZM12.2833 17.5L16.5 16.4667C16.9 16.375 17.1667 16 17.1333 15.5917L17.1 15.1583L16.8917 12.4583H16.8833L16.8333 11.8333H13.3333V13.6583C13.3333 13.975 13.1583 14.2583 12.875 14.4L10.4167 15.625C10.3417 15.6667 10.1917 15.7167 10 15.7167C9.80833 15.7167 9.65833 15.6667 9.58333 15.625L7.125 14.4C6.84167 14.2583 6.66667 13.975 6.66667 13.6583V11.8333H3.15833L3.10833 12.4583L2.9 15.1583L2.86667 15.6417C2.83333 16.05 3.1 16.4167 3.5 16.5167L7.65 17.5L9.46667 17.9333C9.81667 18.0167 10.1833 18.0167 10.5333 17.925L12.2833 17.5Z" fill="currentColor"></path></svg>
              </div>
            <div className={classes.caseImage}>
              <img src={item.image} style={{ height: "100%" }} alt="Case" />
            </div>
            <div className={classes.caseName}>{item.name}</div>
            <div className={classes.casePrice}>
              <div className={classes.casePriceWrapper}>
                ${parseFloat((item.price).toFixed(2))}
              </div>
            </div>
            {selectedCases.find(e => e.slug === item.slug) ? (
              <div className={classes.caseCount}>
                <div className={classes.countInner}>
                  <div className={classes.countInnerBefore} />
                  <div
                    variant="contained"
                    className={classes.buttonDecrease}
                    onClick={() => handleRemoveOne(item)}
                  >
                    <span style={{ WebkitTransform: "rotate(-45deg)", transform: "rotate(-45deg)", fontSize: "24px", fontWeight: 500 }}>-</span>
                  </div>
                  {selectedCases.filter((caseItem) => caseItem.slug === item.slug).length}
                  <div
                    variant="contained"
                    className={classes.buttonIncrease}
                    onClick={() => handleAddOne(item)}
                  >
                    <span style={{ WebkitTransform: "rotate(-45deg)", transform: "rotate(-45deg)", fontSize: "24px", fontWeight: 500 }}>+</span>
                  </div>
                  <div className={classes.countInnerAfter} />
                </div>
              </div>
            ) : (
              <Button
                variant="contained"
                className={classes.addCaseButton}
                onClick={() => handleClick(item)}
              >
                Add Case
              </Button>
            )}
          </div>
        ))
      );
    } catch (error) {
      console.log(error)
    }
    return allBoxes;
  };  

  const renderSelectedCases = () => {
    let allBoxes = [];
      try {
      const uniqueCases = [...new Set(selectedCases.map((item) => item.slug))];
  
      uniqueCases.forEach((slug) => {
        const item = selectedCases.find((item) => item.slug === slug);
  
        allBoxes.push(
          <div className={`${classes.battleCreatorCase} ${classes.selectedCase} ${classes.specialWidth}`} key={item.id} >
            <div className={classes.caseImage}>
              <img src={item.image} style={{ height: "110px" }} alt="Case" />
            </div>
            <div className={classes.caseName}>{item.name}</div>
            <div className={classes.casePrice}>
              <div className={classes.casePriceWrapper}>
                ${parseFloat((item.price).toFixed(2))}
              </div>
            </div>
            <div className={classes.caseCount}>
              <div className={classes.countInner}>
                <div className={classes.countInnerBefore} />
                <div
                  variant="contained"
                  className={classes.buttonDecrease}
                  onClick={() => handleRemoveOne(item)}
                >
                  <span style={{ WebkitTransform: "rotate(-45deg)", transform: "rotate(-45deg)", fontSize: "24px", fontWeight: 500 }}>-</span>
                </div>
                {selectedCases.filter((caseItem) => caseItem.slug === item.slug).length}
                <div
                  variant="contained"
                  className={classes.buttonIncrease}
                  onClick={() => handleAddOne(item)}
                >
                  <span style={{ WebkitTransform: "rotate(-45deg)", transform: "rotate(-45deg)", fontSize: "24px", fontWeight: 500 }}>+</span>
                </div>
                <div className={classes.countInnerAfter} />
              </div>
            </div>
          </div>
        );
      });
    } catch (error) {
      console.log(error);
    }
  
    return allBoxes;
  }

  const boxes = renderCaseOptions();
  const selectedBoxes = renderSelectedCases();
  
  return (
    <div>
      {openCaseItemModal && (
        <CaseItemModal
          handleClose={() => setOpenCaseItemModal(!openCaseItemModal)}
          open={openCaseItemModal}
          withItems={SelectedCaseItems}
          caseName={SelectedCaseName}
        />
      )}
      {loading ? <div></div> :
      <Box className={classes.root}>
        <Container className={classes.container}>
          <div className={classes.topRow}>
            <Button
              color="primary"
              className={classes.cancelButton}
              component={Link}
              to="/battles"
            >
              <ExIcon style={{ height: 20, marginRight: "12px", fill: "rgba(239,250,251,.2)" }} /> Cancel Battle
            </Button>
            <div className={classes.boxContainer}>
              <div className={classes.darkBox}>
                <Typography variant="body1" className={classes.roundsBox}>
                  Rounds <span style={{ fontWeight: 600, color: "#effafb"}}>{totalCaseCount}</span>
                </Typography>
              </div>
              <div className={classes.darkBox}>
                <Typography variant="body1" className={classes.totalCostBox}>
                  Total <span className={classes.priceWrapper}>${totalCost.toFixed(2)}</span>
                </Typography>
              </div>
              <Button
                variant="contained"
                color="primary"
                className={classes.createBattleButton}
                onClick={handleCreateBattle}
              >
                Create Battle
              </Button>
            </div>
          </div>
          <div className={classes.battleCreatorControl}>
            <div className={classes.battleControlSettings}>
              <div className={classes.battleCreatorType}>
                <FormControl>
                  <Select
                    value={selectedMode}
                    onChange={handleModeChange}
                    className="button-toggle"
                  >
                    <MenuItem value="1v1">1v1</MenuItem>
                    <MenuItem value="1v1v1">1v1v1</MenuItem>
                    <MenuItem value="1v1v1v1">1v1v1v1</MenuItem>
                    <MenuItem value="2v2" >2v2</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <Button className={`${classes.button} ${selectedBox === "standard" ? classes.selected : ""}`} onClick={() => setSelectedBox("standard")}>Standard</Button>
              <Button className={`${classes.button} ${ selectedBox === "crazy" ? classes.selectedCrazy : ""}`} onClick={() => setSelectedBox("crazy")}>Crazy</Button>
            </div>
          </div>
          <div className={classes.creatorList}>
            <Dialog 
              classes={{ paper: classes.paper}}
              open={addCasesDialogOpen} 
              onClose={() => setAddCasesDialogOpen(true)}
            >
              <div className={classes.modalContent}>
                <header className={classes.modalHeader}>
                  <Typography className={classes.roundsBox2}>
                    Rounds <span style={{ fontWeight: 600, color: "#effafb"}}>{totalCaseCount}</span>
                  </Typography>
                  <Typography className={classes.totalCostBox}>
                    Total <span className={classes.priceWrapper}>${totalCost.toFixed(2)}</span>
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.cancelButton}
                    style={{ padding: "0px" }}
                    onClick={() => setAddCasesDialogOpen(false)}
                  >
                    <ExIcon style={{ fill: "rgba(239,250,251,.2)" }} />
                  </Button>
                </header>
                <div className={classes.modalBody}>
                  <div className={classes.modalFilter}>
                    <div>
                      <SearchIcon className={classes.searchSvg}/>
                      <input
                        className={classes.inputSearch}
                        type="text"
                        placeholder="Search for..."
                        value={searchInputState}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                    <div className={classes.priceminmax}>
                    <Button className={`${classes.button} ${
                      sortType === "highest" ? classes.selected : ""
                    }`} style={{ width: "80px", marginLeft: "0.5rem ", fontSize: "0.7rem" }}
                    onClick={() => setSortType("highest")}>Highest</Button>
                    <Button className={`${classes.button} ${
                      sortType === "lowest" ? classes.selected : ""
                    }`} style={{ width: "80px", fontSize: "0.7rem" }}
                    onClick={() => setSortType("lowest")}>Lowest</Button></div>
                  </div>
                  <div className={classes.modalList}>
                    {boxes}
                  </div>
                </div>
              </div>
            </Dialog>
            <div className={classes.buttonAdd} onClick={() => setAddCasesDialogOpen(!addCasesDialogOpen)} >
              <div className={classes.addIcon}>
                <svg style={{transform: "rotate(-45deg)", fill: "#fff"}} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.2354 0.96109C10.6831 0.96109 10.2354 1.4088 10.2354 1.96109V10.7429H1.23535C0.683067 10.7429 0.235352 11.1906 0.235352 11.7429V13.6556C0.235352 14.2079 0.683067 14.6556 1.23535 14.6556H10.2354V23.4375C10.2354 23.9897 10.6831 24.4375 11.2354 24.4375H13.2354C13.7876 24.4375 14.2354 23.9897 14.2354 23.4375V14.6556H23.2354C23.7876 14.6556 24.2354 14.2079 24.2354 13.6556V11.7429C24.2354 11.1906 23.7876 10.7429 23.2354 10.7429H14.2354V1.96109C14.2354 1.40881 13.7876 0.96109 13.2354 0.96109H11.2354Z"></path></svg>
              </div>
              <div style={{ display: "flex" }}>
                Add Case
              </div>
            </div>
            {selectedBoxes}
          </div>
        </Container>
      </Box>
    }
    </div>
  );
};

CreateBattle.propTypes = {
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = state => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(CreateBattle);