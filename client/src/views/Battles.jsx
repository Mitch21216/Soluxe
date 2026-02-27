import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { getActiveBattlesGame } from "../services/api.service";
import { battlesSocket } from "../services/websocket.service";
import PropTypes from "prop-types";
import { NavLink as Link } from "react-router-dom";
import { useHistory } from 'react-router-dom';

// MUI Components
import Button from "@material-ui/core/Button";


const useStyles = makeStyles(theme => ({
  root: {
    padding: "30px 85px",
    [theme.breakpoints.down("xs")]: {
      padding: "20px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
    minHeight: "calc(100vh - 7rem)",
    color: "#fff",
    fontFamily: "Rubik",
    overflowY: "hidden"
  },
  crazyModeScrollbar: {
    "&::-webkit-scrollbar-thumb": {
      background: "#3b1b1b !important",
      border: "1px solid #3b1b1b !important;"
    },
    "&::-webkit-scrollbar-track": {
      background: "#160d0d !important",
    },
  },
  topBar: {
    width: "100%",
    margin: "1.5rem auto",
    marginTop: "2.3rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    gap: "12px",
  },
  left: {
  },
  right: {
    display: "flex",
  },
  counterWhite: {
    color: "#fff",
    borderRight: "2px solid hsla(0,0%,100%,.5)",
    paddingRight: "1rem",
    fontWeight: 500,
  },
  counterGreen: {
    paddingLeft: "1rem",
    marginRight: ".5rem",
    color: "#178ac9",
    fontWeight: 500,
  },
  createBattle: {
    border: "1px solid #178ac9",
    background: "#178ac9",
    textTransform: "none",
    color: "#fff",
    fontFamily: "Rubik",
    "&:hover": {
      boxShadow: "0px 0px 8px #178ac9",
      background: "#178ac9"
    }
  },
  rowBattleList: {

  },
  rowOverview: {
    color: "#fff",
    textAlign: "center",
    fontSize: ".9rem",
    letterSpacing: "1px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },  
  roundsCol: {
    display: "flex",
    width: "9.5rem",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "40px",
      marginLeft: "-15px",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "40px",
      marginLeft: "-15px",
    },
  },
  casesCol: {
    width: "100%",
    padding: 0,
    margin: 0,
  },
  priceCol: {
    display: "flex",
    width: "10rem",
    [theme.breakpoints.down("xs")]: {
      position: "absolute",
      top: "45px",
      left: "180px",
    },
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      top: "45px",
      left: "180px",
    },
  },
  playersCol: {
    margin: "auto",
    marginRight: "3rem",
    marginLeft: "10px",
    [theme.breakpoints.down("xs")]: {
      marginRight: "0rem",
      marginLeft: "0px",
      marginTop: "40px",
    },
    [theme.breakpoints.down("sm")]: {
      marginRight: "0rem",
      marginLeft: "0px",
      marginTop: "40px",
    },
  },
  statusCol: {
    display: "flex",
    width: "10rem",
    marginRight: "1.25rem",
    justifyContent: "flex-end",
  },
  noGames: {
    display: "flex",
    flexDirection: "column",
    height: "20rem",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    "&:after": {
      content: "' .'",
      animation: "dots 1s steps(5, end) infinite",
  },
  },
  container: {
    width: "100%",
    minHeight: "32.5rem",
    paddingTop: 50,
    paddingBottom: 120,
    [theme.breakpoints.down("sm")]: {
      paddingTop: 25,
    },
    "& > div": {
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        margin: "auto",
      },
    },
  },
  a: {
    textDecoration: "none",
    //color: "inherit",
    width: "100%",
    color: "#007bff",
    backgroundColor: "initial",
  },
  rowBattleRunning: {
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
    background: "#12171D",
    width: "100%",
    borderRadius: "4px",
    marginTop: "1rem",
    border: "1px solid #161D26",
    padding: "1rem 0",
    transition: "all .3s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.02)"
    },
    [theme.breakpoints.down("xs")]: {
      display: "inherit",
      marginTop: "2rem",
    },
    [theme.breakpoints.down("sm")]: {
      display: "inherit",
      marginTop: "2rem",
    },
  },
  square: {
    border: "1px solid #0D1116",
    background: "#0D1116",
    borderRadius:" 4px",
    width: "4rem",
    height: "4rem",
    margin: "auto",
  },
  number: {
    color: "#fff",
    display: "block",
    margin: "auto 0",
    textAlign: "center",
    padding: "calc(1rem - 2px)",
    lineHeight: "2rem",
    fontSize: "1.4rem",
    fontWeight: 500,
  },
  text: {
    color: "#838b8d",
    display: "block",
    margin: "6px 0 auto",
    textAlign: "center",
  },
  svgDot: {
    position: "absolute",
    top: 0,
    right: "15%",
    width: "2rem",
    WebkitAnimation: "blink-b4490708 1.25s infinite",
    animation: "blink-b4490708 1.25s infinite",
    transition: "all .25s ease-in-out",
  },
  caseDisplay: {
    background: "#0D1116",
    borderRadius: "4px",
    overflow: "scroll",
    "&::-webkit-scrollbar": {
      width: "0px",
      height: "7px",
      margin: "15px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#798183",
      borderRadius: "5px",
      margin: "15px",
    },
    "&::-webkit-scrollbar-track": {
      borderRadius: "5px",
      background: "#0d1116",
      margin: "15px",
    },
    gridArea: "cases",
    padding: "9px 0",
    flexBasis: 0,
    flexGrow: 1,
    maxWidth: "100%",
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      padding: "20px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
  },
  caseRight: {
    background: "linear-gradient(90deg,rgba(21,23,25,.8),rgba(31,34,37,0))",
    borderRadius: "4px 0 0 4px",
    WebkitTransform: "matrix(-1,0,0,1,0,0)",
    transform: "matrix(-1,0,0,1,0,0)",
    height: "100%",
    width: "30%",
    right: "-1px",
    position: "absolute",
    zIndex: 1,
    top: 0,
  },
  scroller: {
    //overflowY: "scroll",
    height: "100%",
  },
  case: {
    flexGrow: 0,
    marginLeft: "1.5rem",
    backgroundSize: "100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50%",
    maxHeight: "110px",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "0.6rem",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "0.6rem",
    },
  },
  caseList: {  
    display: "flex",
    height: "100%",
    width: "100%",
    flexWrap: "nowrap",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  newPrice: {
    display: "block",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1.15rem",
    margin: "auto",
    //marginLeft: "1rem",
  },
  newPriceWrapper: {
    display: "inline-flex",
    alignItems: "baseline",
    color: "#eee !important",
  },
  newPriceWrapperImg: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    height: "1rem",
    width: "1rem",
    marginRight: "6px",
  },
  squareWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "1rem 0",
    boxSizing: "border-box",
  },
  imageCol: {
    boxShadow: "0 0 0 2px #178ac9",
    background: "#fff",
    borderRadius: "4px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    height: "24px",
    width: "24px",
    justifyContent: "center",
    alignItems: "center",
  },
  rowSquareShort: {
    display: "inline-grid",
    borderRadius: "4px",
    "-webkit-transform": "rotate(-45deg)",
    transform: "rotate(-45deg)",
    gridTemplateRows: "1fr 1fr",
    gridTemplateColumns: "1fr 1fr",
    gap: ".4rem",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  img:{
    position: "absolute",
    height: "24px",
    width: "24px",
    "-webkit-transform": "rotate(45deg) scale(1.5)",
    transform: "rotate(45deg) scale(1.5)",
  },
  buttonGreenStripe: {
    fontWeight: 600,
    textTransform: "uppercase",
    padding: ".5rem 1.75rem",
    border: "1px solid #4ea24d",
    background: "#4ea24d",
    backgroundImage: "none",
    backgroundSize: "auto",
    backgroundColor: "#4ea24d",
    color: "#fff",
    fontSize: ".95rem",
    borderRadius: "4px",
    letterSpacing: "1px",
    cursor: "pointer",
    marginLeft: "1.25rem",
    transition: "all .15s ease-in-out",
    verticalAlign: "middle",
    display: "inline-block",
    boxSizing: "border-box"
  },
  noOne: {
    border: "2px dashed rgba(239,250,251,.2)",
    borderRadius: "4px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    height: "24px",
    width: "24px",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBattle: {
    background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 20px), linear-gradient(90deg,#1a6087bd,#12171D 50%,#12171D)",
    border: "none",
  },

  activeBattleCrazy: {
    background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 20px), linear-gradient(90deg, #682626, #1d1212 50%, #1d1212)",
    border: "none",
  },

  topBarLeft:  {
    display: "flex",
    marginRight: "32px",
    flexShrink: 0,
  },
  topBarRight: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  topBar2: {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px",
    [theme.breakpoints.down("sm")]: {
      display: "inherit",
    },
    [theme.breakpoints.down("xs")]: {
      display: "inherit",
    },
  },
  optionButton: {
    fontWeight: 400,
    lineHeight: "130%",
    letterSpacing: ".1px",
    color: "#fff",
    transition: "all .2s ease",
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    background: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      filter: "brightness(130%)",
    }
  },
  button: {  
    textTransform: "none",
    width: "100px",
    padding: "0 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "8px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: 400,
    color: "rgba(239,250,251,.72)",
    background: "#12171D",
    transition: "all .3s ease",
    fontFamily: "Rubik",
    border: "1px solid #161D26",
    backgroundSize: "24px auto",
    height: "42px",
  },
  selected: {
    color: "#effafb",
    background: "#2a2a38",
    border: "2px solid #178ac9 !important",
  },
  selected2: {
    color: "#effafb",
    background: "#2a2a38",
    border: "2px solid #178ac9 !important",
  },
}));

const Battles = ({ user, isAuthenticated }) => {
  // Declare State
  const classes = useStyles();
  const { addToast } = useToasts();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [spinningBattlesCount, setSpinningBattlesCount] = useState(0);
  const [joinableBattlesCount, setJoinableBattlesCount] = useState(0);
  const [sortType, setSortType] = useState("highest");
  const [sortType2, setSortType2] = useState("waiting");


  // componentDidMount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedGames = await getActiveBattlesGame();       
        
        setGames(fetchedGames);
    
        let jbc = 0;
        let sbc = 0;
        for (let i = 0; i < fetchedGames.length; i++) {
          if (fetchedGames[i].status === 1) {
            jbc++;
          } else {
            sbc++;
          }
        }
    
        setJoinableBattlesCount(jbc);
        setSpinningBattlesCount(sbc);
    
        setLoading(false);
      } catch (error) {
        console.log("There was an error while loading case battles data:", error);
      }
    };    

    // Initially, fetch data
    fetchData();

    const newBattle = data => {
      setJoinableBattlesCount(prev => prev + 1);
      console.log(data)
      setGames(state => (state ? [data, ...state] : null));
    }

    const battlesStart = data => {
      setJoinableBattlesCount(prev => prev-1);
      setSpinningBattlesCount(prev => prev+1);

      setGames(prevGames => {
        const updatedGames = prevGames.map(game => {
          if (game.id === data.battleId) {
            return { ...game, status: 2 };
          }
          return game;
        });
        return updatedGames;
      });
    }

    const battlesRound = data => {

    }

    const battlesJoin = data => {
      setGames(prevGames => {
        const updatedGames = prevGames.map(game => {
          if (game.id === data.battleId) {
            const updatedPlayers = [...game.players, data.user];
            return { ...game, players: updatedPlayers };
          }
          return game;
        });
        return updatedGames;
      });
    }

    const battlesFinised = data => {
      setGames(prevGames => prevGames.filter(game => game.id !== data.battleId));
      setSpinningBattlesCount(prev => prev-1);
    }

    const battlesCancelled = battleId => {
      setGames(prevGames => prevGames.filter(game => game.id !== battleId));
      setSpinningBattlesCount(prev => prev-1);
    }

    // Listeners
    battlesSocket.on("battles:new", newBattle);
    battlesSocket.on("battles:start", battlesStart);
    battlesSocket.on("battles:round", battlesRound);
    battlesSocket.on("battles:join", battlesJoin);
    battlesSocket.on("battles:finished", battlesFinised);
    battlesSocket.on("battles:cancelled", battlesCancelled)
    
    return () => {
      // Remove Listeners
      battlesSocket.off("battles:new", newBattle)
      battlesSocket.off("battles:start", battlesStart);
      battlesSocket.off("battles:round", battlesRound);
      battlesSocket.off("battles:join", battlesJoin);
      battlesSocket.off("battles:finished", battlesFinised);
      battlesSocket.off("battles:cancelled", battlesCancelled)
    };
  }, [addToast]);

  const fwd = (item) => {
    history.push(`/battles/${item.id}`);
  }

  const renderGamesBoxes = () => {
    let sortedGames = [...games]; 

    if (sortType === "highest") {
      sortedGames.sort((a, b) => b.price - a.price);
    } else if (sortType === "lowest") {
      sortedGames.sort((a, b) => a.price - b.price);
    }

    if (sortType2 === "waiting") {
      sortedGames.sort((a, b) => {
        if (a.status === 1 && b.status !== 1) return -1; 
        if (a.status !== 1 && b.status === 1) return 1; 
        return 0; 
      });
    } else if (sortType2 === "running") {
      sortedGames.sort((a, b) => {
        if (a.status === 2 && b.status !== 2) return -1; 
        if (a.status !== 2 && b.status === 2) return 1; 
        return 0;
      });
    }
    

    let allBoxes = [];
    try {
      const boxes = sortedGames.map((item) => {
        const elements = [];
        for (let i = 1; i < item.playerCount; i++) {
          if (item.players[i]) {
            elements.push(
              <div key={item.players[i].id} className={classes.imageCol}>
                <img className={classes.img} src={item.players[i].pfp} alt="Profile Pic" />
              </div>
            );
          } else {
            // Provide a unique key for the placeholder div
            elements.push(<div key={`noOne-${i}`} className={classes.noOne}></div>);
          }
        }

        return (

          <div style={{cursor: "pointer", position: "relative"}} className={`${classes.a}` } key={item.id}>
            <div style={{border: item.isCrazyMode ? "2px solid #FF5353" : undefined, backgroundColor: item.isCrazyMode ? "#1d1212" : undefined}} className={`${classes.rowBattleRunning} ${item.status === 2 ? item.isCrazyMode ? classes.activeBattleCrazy : classes.activeBattle : ""}`} onClick={() => fwd(item)}>
              {item.isCrazyMode 
              ?<div style={{padding: "5px 10px", fontSize: "11px", background: "#FF5353", width: "fit-content", borderRadius: "5px", color: "white", position: "absolute", zIndex: "99", left: "-45px", top: "42%", transform: "rotate(270deg)"}}>CRAZY MODE</div>
              : ""}
              <div className={classes.roundsCol}>
                <div style={{ margin: "auto "}}>
                  <div style={{border: item.isCrazyMode ? "1px solid #160d0d" : undefined, backgroundColor: item.isCrazyMode ? "#160d0d" : undefined}} className={classes.square}>
                    <span  className={classes.number}>{item.cases.length}</span>
                    <span className={classes.text}>{item.status === 2 ? "Running" : "Rounds"}</span>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: item.isCrazyMode ? "#160d0d" : undefined}} className={`${classes.caseDisplay}  ${item.isCrazyMode ? classes.crazyModeScrollbar : ""}`}>
              <div className={classes.right} />
              <div className={classes.scroller}>
                <div className={classes.caseList}>
                  {item.cases.map((caseItem, index) => (
                    <div key={index} className={classes.case}>
                      <img style={{ maxWidth: "6rem", }} src={caseItem.image} alt="Case" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
              <div className={classes.priceCol}>
                <span className={classes.newPrice}>
                  <div className={classes.newPriceWrapper}>
                    ${item.price.toFixed(2)}
                  </div>
                </span>
              </div>
              <div className={classes.playersCol}>
                <div className={classes.squareWrapper}>
                  <div className={classes.rowSquareShort}>
                    <div className={classes.imageCol} ><img className={classes.img} src={item.players[0].pfp} alt="Profile Pic" /></div>
                    {elements}
                  </div>
                </div>
                <span className={classes.text}>{item.players.length}/{item.playerCount}</span>
              </div>
            </div>
          </div>
        );
      });
      allBoxes.push(boxes);
    } catch (error) {
      console.log(error)
    }
    return allBoxes;
  }

  const gamesBoxes = renderGamesBoxes();

  return (
    <div className={classes.root}>
      <div className={classes.topBar2}>
        <div className={classes.topBarLeft}>
          <h1 className={classes.optionButton}>CS2 & CS:GO Case Battles</h1>
        </div>
        <div className={classes.topBarRight}>
          <Button className={`${classes.button} ${
            sortType2 === "waiting" ? classes.selected2 : ""
          }`} style={{ width: "80px", marginLeft: "0.5rem ", fontSize: "0.7rem" }}
          onClick={() => setSortType2("waiting")}>Waiting</Button>
          <Button className={`${classes.button} ${
            sortType2 === "running" ? classes.selected2 : ""
          }`} style={{ width: "80px", fontSize: "0.7rem" }}
          onClick={() => setSortType2("running")}>Running</Button>
          <Button className={`${classes.button} ${
            sortType === "highest" ? classes.selected : ""
          }`} style={{ width: "80px", marginLeft: "0.5rem ", fontSize: "0.7rem" }}
          onClick={() => setSortType("highest")}>Highest</Button>
          <Button className={`${classes.button} ${
            sortType === "lowest" ? classes.selected : ""
          }`} style={{ width: "80px", fontSize: "0.7rem" }}
          onClick={() => setSortType("lowest")}>Lowest</Button>
        </div>
      </div>
      <div className={classes.topBar}>
          <div className={classes.left}>
            <Link exact to="/battles/create">
              <Button
                size="medium"
                variant="contained"
                className={classes.createBattle}
              >
                <span>Create Battle</span>
              </Button>
            </Link>
          </div>
          <div className={classes.right}>
            <div className={classes.counterWhite}>
              {spinningBattlesCount} Active Battles
            </div>
            <div className={classes.counterGreen}>
              {joinableBattlesCount} Joinable Battles
            </div>
          </div>
        </div>
      <div className={classes.rowBattleList}>
        <div spacing={3}>
          {loading ? "" : games.length > 0 ? (
            <div>
              {gamesBoxes}
            </div>
          ) : (
            <div className={classes.noGames}>
              <p>Waiting for new Battles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
  
Battles.propTypes = {
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = state => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Battles);
