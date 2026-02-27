import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core";

import { NavLink as Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logout } from "../../actions/auth";
import parseCommasToThousands from "../../utils/parseCommasToThousands";
import cutDecimalPoints from "../../utils/cutDecimalPoints";
import { getUserVipData } from "../../services/api.service";

//components
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Skeleton from "@material-ui/lab/Skeleton";

// Components
import { PlayAmount as RoulettePlayAmount } from "../roulette/PlayAmount";
import { PlayAmount as WheelPlayAmount } from "../wheel/PlayAmount";
import { PlayAmount as CoinflipPlayAmount } from "../coinflip/PlayAmount";
import { PlayAmount as BattlesPlayAmount } from "../battles/PlayAmount";
import { PlayAmount as JackpotPlayAmount } from "../jackpot/PlayAmount";
import { PlayAmount as CrashPlayAmount } from "../crash/PlayAmount";
import { PlayAmount as MinesPlayAmount } from "../mines/PlayAmount"
import { RaceAmount } from "../RaceAmount";

// Modals
import Market from "../modals/MarketModal";
import Deposit from "../modals/DepositModal";
import Vip from "../modals/VIPModal";
import Free from "../modals/FreeModal";

const useStyles = makeStyles(theme => ({
  root: {
    height: "5.58rem",
    "& > div": {
      "& > div": {
        width: "100%",
        textAlign: "center",
        [theme.breakpoints.down("xs")]: {
          textAlign: "center",
        },
        "& > a": {
          color: "#707479",
          fontFamily: "Rubik",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: ".1em",
          cursor: "pointer",
          textDecoration: "none",
        },
        "& > a:hover": {
          textDecoration: "none",
          outline: "none",
        },
      },
    },
  },
  root2: {
    display: "inherit",
    paddingLeft: "0px",
    paddingRight: "0px",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
    },
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "column",
    },
  },
  subJackpot: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "20px",
        marginLeft: "21px",
      },
    },
  },
  subActiveJackpot: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "20px",
        marginLeft: "21px",
        color: "#2c80af",
      },
    },
  },
  subCoinflip: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      fontFamily: "Rubik",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "19px",
        marginLeft: "20px",
      },
    },
  },
  subBattles: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      fontFamily: "Rubik",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "19px",
        marginLeft: "20px",
      },
    },
  },
  subActiveBattles: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "19px",
        marginLeft: "20px",
        color: "#2c80af",
      },
    },
  },
  subActiveCoinflip: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "19px",
        marginLeft: "20px",
        color: "#2c80af",
      },
    },
  },
  subRoulette: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "21px",
        marginLeft: "21px",
      },
    },
  },
  subActiveRoulette: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "21px",
        marginLeft: "21px",
        color: "#2c80af",
      },
    },
  },
  subCrash: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "20px",
        marginLeft: "21px",
        color: "#707479",
      },
    },
  },
  subActiveCrash: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "20px",
        marginLeft: "21px",
        color: "#2c80af",
      },
    },
  },

  subRace: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "22px",
        marginLeft: "22px",
        color: "#707479",
      },
    },
  },
  subActiveRace: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "22px",
        marginLeft: "22px",
        color: "#2c80af",
      },
    },
  },
  subDeposit: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "127px",
        marginLeft: "-10px",
        color: "#707479",
      },
    },
  },
  subWithdraw: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "113px",
        marginLeft: "-10px",
        color: "#707479",
      },
    },
  },
  subAffiliate: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      color: "#707479",
      borderLeft: "2px solid #191f26",
      borderRadius: "0px",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "&:hover": {
        backgroundColor: "rgb(23 29 34)",
        color: "#e0e0e0",
        "& span .MuiButton-startIcon": {
          color: "#2c80af",
        },
      },
      "&:active": {
        color: "#e0e0e0",
      },
      "& span .MuiButton-startIcon": {
        marginRight: "110px",
        marginLeft: "-11px",
        color: "#707479",
      },
    },
  },
  subActiveAffiliate: {
    textDecoration: "none",
    "& > button": {
      width: "100%",
      height: "2.5rem",
      fontFamily: "Rubik",
      fontSize: "12.5px",
      fontWeight: 500,
      letterSpacing: ".05em",
      color: "#e0e0e0",
      borderLeft: "2px solid #1a90d1",
      borderRadius: "0px",
      marginRight: 20,
      "& img": {
        opacity: 0.15,
      },
      "& span .MuiButton-startIcon": {
        marginRight: "110px",
        marginLeft: "-11px",
        color: "#2c80af",
      },
    },
  },
  category: {
    color: "#707479",
    fontFamily: "Rubik",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: ".05em",
    marginLeft: "32px",
  },
  reverse: {
    textTransform: "capitalize",
  },
  reverse2: {
    display: "flex",
  },
  login: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "25px",
    paddingTop: "9px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "35px",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "35px",
    },
    [theme.breakpoints.down("md")]: {
      marginBottom: "35px",
    },
    "& > button": {
      height: 40,
    },
    "& > h5": {
      marginRight: 20,
      fontWeight: 500,
      color: "#e0e0e0",
    },
  },
  noLink: {
    textDecoration: "none",
    marginLeft: "77px",
  },
  google: {
    fontFamily: "Rubik",
    textTransform: "capitalize",
    fontSize: "12px",
    width: "7.5rem",
    background: "#2196f3",
    color: "white",
    margin: "1.5rem 0rem",
    "&:hover": {
      opacity: "0.9",
      background: "#2196f3",
    },
  },
  pfp: {
    padding: "1rem 0rem 0rem 1.5rem",
    outline: "none",
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "0rem",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "0rem",
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "0rem",
    },
    "& div": {
      outline: "none",
      height: "2.5rem",
      width: "2.5rem",
      borderRadius: "100%",
    },
  },
  avatar2: {
    outline: "none",
    "&:hover": {
      transition: "all 400ms",
      transform: "scale(1.06)",
      WebkitTransform: "scale(1.06)",
    },
  },
  avatar3: {
    "& img": {
      padding: "2px", borderRadius: "50%",
    },

  },

  pfpp: {
    marginTop: "15px",
    "& div": {
      height: "2.5rem",
      width: "2.5rem",
      borderRadius: "100%",
    },
    "& .usernamenav": {
      color: "#ffc107",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
    "& .levelnav": {
      color: "#fff",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
      padding: "5px",
      marginLeft: "155px",
      borderRadius: "5px",
    },
    "& .levelnav:hover": {
      color: "#fff",
      filter: "drop-shadow(0px 0px 15px #2b2f34) invert(0%)",
    },
    "& .nonenav": {
      color: "#d5d6d8",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
    "& .bronzenav": {
      color: "#C27C0E",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
    "& .silvernav": {
      color: "#95A5A6",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
    "& .goldnav": {
      color: "#b99309",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
    "& .diamondnav": {
      color: "#3498DB",
      fontSize: "11px",
      fontFamily: "Rubik",
      fontWeight: 500,
      textTransform: "uppercase",
    },
  },
  balance: {

  },
  onlineOrNot1: {
    marginTop: "0px"
  },
  onlineOrNot2: {
    marginTop: "180px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "0px"
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "0px"
    },
    [theme.breakpoints.down("md")]: {
      marginTop: "0px"
    },
  },
  price: {
    fontFamily: "Rubik",
    color: "#1a90d1",
    fontWeight: 500,
    letterSpacing: ".1em",
    margin: "auto",
    position: "absolute",
    marginTop: "-1px",
  },
  freeinfo: {
    "& .freenav": {
      color: "#1a90d1",
    },
    "& .freenav:hover": {
      color: "#1a77ab",
    },
  },
}));

const HeaderNav = ({ isAuthenticated, isLoading, user, logout, handleClose }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [openMarket, setOpenMarket] = useState(false);
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openVip, setOpenVip] = useState(false);
  const [openFree, setOpenFree] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const [vipData, setVipData] = useState(null);
  const [vipDataColor, setVipDataColor] = useState(null);

  // If user has clicked affiliate link
  useEffect(() => {

    const fetchData = async () => {
      try {
        if (isAuthenticated) {
          setLoading(true);
          const data = await getUserVipData();
          // Update state
          setVipData(data);
          const currentMajorLevel = data.majorLevelNames.find((levelName, index) => {
            const currentLevelIndex = data.allLevels.findIndex((level) => level.name === data.currentLevel.name);
            const nextIndex = data.allLevels.findIndex((level) => level.levelName === data.majorLevelNames[index + 1]);
            if (currentLevelIndex >= index && (nextIndex === -1 || currentLevelIndex < nextIndex)) {
              return true;
            }
            return false;
          });
          const currentMajorLevelIndex = data.majorLevelNames.indexOf(currentMajorLevel);
          setVipDataColor(data.majorLevelColors[currentMajorLevelIndex]);
        }
        setLoading(false);
      } catch (error) {
        console.log("There was an error while loading user vip data:", error);
      }
    };
    fetchData();
    // Get affiliate code from localStorage
    const storageCode = localStorage.getItem("affiliateCode");
    // If user is logged in
    if (!isLoading && isAuthenticated && storageCode) {

      // Remove item from localStorage
      localStorage.removeItem("affiliateCode");
      setOpenFree(true);
      setAffiliateCode(storageCode);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <Toolbar variant="dense" className={classes.root2}>
      <Market handleClose={() => setOpenMarket(!openMarket)} open={openMarket} user={user} />
      <Deposit handleClose={() => setOpenDeposit(!openDeposit)} open={openDeposit} user={user} />
      <Vip handleClose={() => setOpenVip(!openVip)} open={openVip} />
      <Free handleClose={() => setOpenFree(!openFree)} open={openFree} code={affiliateCode} />
      <Box className={classes.root}>
        {isLoading ? (
          <div className={classes.login}>
            <Skeleton
              height={36}
              width={120}
              animation="wave"
              variant="rect"
              style={{ marginRight: "1rem" }}
            />
            <Skeleton height={36} width={120} animation="wave" variant="rect" />
          </div>
        ) : isAuthenticated && user ? (
          <Box>
            <div className={classes.login}>
              <Box className={classes.pfp}>
                <Box className={classes.avatar2}>
                  <Link exact to="/profile" style={{ outline: "none", }}>
                    <Avatar variant="rounded" src={user.avatar} className={classes.avatar3} style={{ border: `2px solid ${vipDataColor}`, }} />
                  </Link>
                </Box>
                <Link
                  style={{
                    textDecoration: "none",
                    marginLeft: "52px",
                    outline: "none",
                    position: "absolute",
                    color: "#fff",
                    marginTop: "4px",
                    fontSize: "13px",
                  }}
                  exact to="/profile"><span className="usernamenav">{user.username}</span>
                  <Box className={classes.price}>
                    $
                    {parseCommasToThousands(
                      cutDecimalPoints(user.wallet.toFixed(7))
                    )}
                  </Box>
                </Link>
              </Box>
              {/* <Box className={classes.pfpp}>
                <span>
                  <span
                    style={{ cursor: "pointer", }}
                    onClick={() => setOpenVip(!openVip)}
                  >
                    {loading ?
                      (
                        <span className="levelnav"></span>
                      ) : (
                        <span
                          className="levelnav"
                          style={{ background: `${vipDataColor}`, }}
                        >
                          {vipData?.currentLevel?.name}
                        </span>
                      )}
                  </span>
                </span>
              </Box> */}
            </div>
            <Box>
              <Box className={classes.balance}>
                <Box className={classes.reverse} flexDirection="column">

                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box>
            <Link to="/registration" className={classes.noLink} style={{ outline: "none", }}>
              <Button disableRipple className={classes.google} variant="contained">
                <i
                  style={{ marginRight: 6, fontSize: 13 }}
                  className="fas fa-sign-in-alt"
                ></i>
                SIGN IN
              </Button>
            </Link>
          </Box>
        )}
      </Box>
      <Box style={{ paddingTop: "25px", width: "100%", }}>
      {/* <span className={classes.category}>HOUSE</span> */}
        {/* <br /><br /> */}
        {/* <Link
          exact
          activeClassName={classes.subActiveRoulette}
          className={classes.subRoulette}
          to="/wheel"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg xmlns="http://www.w3.org/2000/svg" version="1.0" style={{fontSize: "17px"}} width="25px" height="25px" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" transform="rotate(0) scale(1, 1)"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#707479" stroke="none"><path d="M2147 5100 c-47 -37 -44 -65 24 -215 35 -77 58 -139 53 -144 -5 -4 -43 -14 -84 -20 -41 -7 -126 -26 -188 -42 -668 -177 -1225 -634 -1527 -1254 -115 -236 -181 -449 -222 -715 -24 -162 -24 -501 1 -665 39 -258 110 -482 226 -720 228 -464 610 -847 1075 -1075 172 -84 298 -131 469 -175 215 -54 342 -69 586 -69 244 0 371 15 586 69 326 83 652 246 911 456 99 80 271 252 350 349 211 262 375 588 458 914 54 215 69 342 69 586 1 393 -69 698 -239 1045 -182 373 -447 680 -790 916 -273 188 -616 329 -925 380 -41 6 -79 16 -84 20 -5 5 18 67 53 144 68 150 71 178 24 215 -25 19 -40 20 -413 20 -373 0 -388 -1 -413 -20z m633 -157 c0 -15 -213 -473 -220 -473 -7 0 -220 458 -220 473 0 4 99 7 220 7 121 0 220 -3 220 -7z m-380 -559 c87 -192 110 -224 160 -224 50 0 73 32 160 224 74 162 88 186 107 186 17 0 23 -6 23 -22 0 -12 -20 -135 -45 -275 -25 -139 -45 -256 -45 -260 0 -5 -90 -8 -200 -8 -110 0 -200 3 -200 8 0 4 -20 121 -45 260 -25 140 -45 263 -45 275 0 16 6 22 23 22 19 0 33 -24 107 -186z m-305 124 c10 -41 95 -532 92 -534 -1 -1 -49 -16 -107 -34 -58 -17 -140 -48 -183 -67 -42 -20 -79 -34 -80 -32 -13 17 -277 482 -277 488 0 19 245 120 405 167 133 40 143 40 150 12z m1082 -13 c160 -46 403 -146 403 -166 0 -6 -264 -471 -277 -488 -1 -2 -38 12 -80 32 -43 19 -125 50 -183 67 -58 18 -106 33 -107 34 -3 2 82 493 92 534 3 12 12 22 19 22 8 0 67 -16 133 -35z m-1650 -500 l141 -245 -72 -52 c-39 -29 -106 -86 -148 -126 -52 -50 -81 -72 -90 -66 -7 4 -107 86 -221 182 l-208 175 53 55 c83 85 207 191 303 260 48 34 90 62 94 62 4 0 70 -110 148 -245z m2316 177 c90 -64 216 -173 295 -254 l53 -55 -208 -175 c-114 -96 -214 -178 -221 -182 -9 -6 -38 16 -90 66 -42 40 -109 97 -148 126 l-72 52 141 245 c104 179 146 244 156 240 8 -3 51 -32 94 -63z m-1373 -706 l0 -373 -52 -11 c-77 -15 -155 -47 -233 -93 l-68 -41 -258 258 c-143 143 -258 263 -256 269 8 22 184 145 285 197 160 84 338 138 537 161 17 2 33 5 38 6 4 0 7 -167 7 -373z m350 347 c203 -33 436 -134 606 -262 48 -36 89 -71 91 -76 2 -6 -113 -126 -256 -269 l-258 -258 -68 41 c-78 46 -156 78 -232 93 l-53 11 0 373 0 373 38 -5 c20 -3 80 -12 132 -21z m-1785 -268 c105 -87 196 -164 204 -171 11 -10 4 -26 -42 -96 -30 -45 -75 -122 -98 -171 -33 -65 -47 -86 -59 -81 -8 3 -127 46 -265 96 -137 50 -251 92 -253 93 -2 2 17 47 42 100 52 112 126 238 200 342 43 60 53 69 66 59 8 -7 101 -84 205 -171z m3413 -30 c53 -85 157 -294 150 -300 -2 -1 -115 -43 -253 -93 -137 -50 -257 -93 -265 -96 -12 -5 -26 16 -59 81 -23 49 -68 125 -98 171 -31 47 -51 87 -47 92 5 5 103 87 218 184 l210 175 45 -62 c24 -33 69 -102 99 -152z m-2714 -434 l260 -260 -27 -38 c-41 -60 -86 -164 -104 -242 l-17 -71 -372 0 -372 0 5 48 c28 280 142 556 321 780 19 23 37 42 41 42 3 0 123 -117 265 -259z m1997 165 c155 -206 244 -437 283 -738 l5 -38 -373 0 -373 0 -11 53 c-15 76 -47 154 -93 232 l-41 68 258 258 c143 143 263 258 269 256 5 -2 40 -43 76 -91z m-2992 -296 c134 -49 246 -92 249 -95 3 -3 -5 -46 -17 -96 -12 -50 -27 -135 -33 -190 l-12 -99 -283 0 -283 0 0 39 c0 103 70 491 97 534 3 5 12 5 22 2 9 -4 126 -47 260 -95z m3958 -33 c31 -125 63 -331 63 -408 l0 -39 -283 0 -283 0 -12 99 c-6 55 -21 140 -33 190 -12 50 -20 93 -17 96 9 10 513 193 523 191 6 -2 24 -60 42 -129z m-1996 -13 c94 -28 171 -74 240 -143 107 -107 159 -231 159 -381 0 -150 -52 -274 -159 -381 -107 -107 -231 -159 -381 -159 -150 0 -274 52 -381 159 -107 107 -159 231 -159 381 0 241 152 444 390 521 72 23 217 25 291 3z m-1763 -713 c6 -55 21 -140 33 -190 12 -50 20 -93 17 -96 -13 -13 -524 -193 -530 -187 -24 26 -98 424 -98 533 l0 39 283 0 283 0 12 -99z m925 28 c18 -78 63 -182 104 -242 l27 -38 -260 -260 c-142 -142 -263 -258 -269 -256 -22 8 -145 184 -197 285 -86 164 -133 322 -162 545 l-5 37 373 0 372 0 17 -71z m2151 34 c-29 -223 -76 -381 -162 -545 -52 -101 -175 -277 -197 -285 -6 -2 -126 113 -269 256 l-258 258 41 68 c46 78 78 156 93 233 l11 52 373 0 373 0 -5 -37z m746 -2 c0 -109 -74 -507 -98 -533 -6 -6 -517 174 -530 187 -3 3 5 46 17 96 12 50 27 135 33 190 l12 99 283 0 283 0 0 -39z m-2607 -461 c44 -34 170 -90 245 -107 l72 -17 0 -372 0 -373 -37 5 c-129 17 -241 41 -333 71 -161 53 -348 157 -470 262 l-35 30 260 260 c143 144 263 261 266 261 4 0 18 -9 32 -20z m1112 -241 l260 -260 -35 -30 c-122 -105 -309 -209 -470 -262 -92 -30 -204 -54 -332 -71 l-38 -5 0 373 0 372 72 17 c75 17 201 73 245 107 14 11 28 20 32 20 3 0 123 -117 266 -261z m-2166 104 c24 -49 68 -125 98 -171 31 -47 51 -87 47 -92 -5 -5 -103 -87 -218 -183 l-209 -175 -41 56 c-75 103 -136 205 -197 330 -34 68 -59 125 -57 126 3 3 519 193 528 195 3 1 25 -38 49 -86z m3246 -15 c138 -50 252 -92 253 -94 2 -1 -23 -58 -57 -126 -61 -125 -122 -227 -197 -330 l-41 -56 -209 175 c-115 96 -213 178 -218 183 -4 5 16 45 47 92 30 46 75 122 98 171 33 65 47 86 59 81 8 -3 128 -46 265 -96z m-2910 -439 c33 -33 99 -89 146 -125 l87 -65 -140 -242 c-77 -133 -142 -244 -144 -246 -12 -13 -241 166 -363 284 l-93 91 216 182 c120 100 221 182 225 182 3 0 33 -27 66 -61z m2546 -126 l211 -177 -93 -91 c-122 -118 -351 -297 -363 -284 -2 2 -67 113 -144 246 l-140 242 87 65 c47 36 113 92 146 126 33 33 66 58 73 55 7 -2 107 -84 223 -182z m-2080 -187 c41 -19 121 -49 179 -66 58 -18 106 -33 107 -34 3 -2 -82 -493 -92 -535 -5 -20 -10 -22 -41 -16 -47 8 -236 67 -302 94 -99 40 -212 94 -212 102 0 13 276 489 284 489 2 0 36 -15 77 -34z m1539 -203 c74 -130 136 -241 138 -248 7 -27 -367 -173 -512 -200 -31 -6 -36 -4 -41 16 -10 42 -95 533 -92 534 1 1 54 18 117 38 63 20 142 50 175 66 33 16 65 30 70 30 6 0 71 -106 145 -236z m-651 -103 c56 -316 65 -379 60 -385 -20 -19 -558 -19 -578 0 -5 6 4 69 60 385 l31 175 198 0 198 0 31 -175z" fill="#707479"/></g></svg>} className={classes.reverse2}>
            <WheelPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>WHEEL</span>
          </Button>
        </Link> */}
        {/* <Link
          exact
          activeClassName={classes.subActiveCrash}
          className={classes.subCrash}
          to="/crash"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg style={{ fontSize: "17px", }} width="25" height="25" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3.354 19.596a1.644 1.644 0 1 1 2.05 2.051l-2.353.714a.329.329 0 0 1-.41-.41l.713-2.355Zm8.82-15.568C15.05 2.154 18.47 2 22.015 2c.544 0 .986.441.984.985 0 3.403-.156 6.966-2.029 9.842-.987 1.517-2.37 2.777-3.916 3.794a8.228 8.228 0 0 1-3.423 6.197.99.99 0 0 1-.949.109.988.988 0 0 1-.595-.747c-.15-.886-.548-1.868-1.133-2.86-.656.18-1.293.325-1.89.428a.985.985 0 0 1-.866-.274l-2.674-2.673a.985.985 0 0 1-.274-.866c.103-.596.25-1.233.428-1.889-.99-.585-1.972-.983-2.858-1.132a.985.985 0 0 1-.638-1.545A8.232 8.232 0 0 1 8.38 7.945c1.016-1.546 2.276-2.929 3.793-3.917Zm3.69 7.752a2.848 2.848 0 1 0 0-5.696 2.848 2.848 0 0 0 0 5.696Z"></path></svg>} className={classes.reverse2}>
            <CrashPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>CRASH</span>
          </Button>
        </Link> */}
        {/* <br/>        <div style={{ borderTop: "1px solid #161b21", }}></div><br/> */}
        <span className={classes.category}>GAMES</span>
        <br />
        <br />
        <Link
          exact
          activeClassName={classes.subActiveRoulette}
          className={classes.subRoulette}
          to="/roulette"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg style={{ fontSize: "17px", }} width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M11.956 12.069 5.4 4.255A10.24 10.24 0 0 0 3.124 6.97l8.832 5.1ZM8.467 21.657c1.088.397 2.262.613 3.488.613v-10.2l-3.488 9.587Z" fill="currentColor"></path><path d="m11.956 12.07-8.832 5.1A10.283 10.283 0 0 0 5.4 19.882l6.556-7.814Z" fill="#161b21"></path><path d="M11.956 12.07 5.4 19.882a10.16 10.16 0 0 0 3.067 1.774l3.489-9.588Z" fill="currentColor"></path><path d="M1.912 13.84a10.11 10.11 0 0 0 1.212 3.33l8.832-5.1-10.044 1.77Z" fill="currentColor"></path><path d="m11.956 12.07 8.834 5.1a10.17 10.17 0 0 0 1.212-3.33l-10.046-1.77Z" fill="#161b21"></path><path d="M11.956 12.07v10.2c1.225 0 2.4-.216 3.488-.613l-3.488-9.588Z" fill="#161b21"></path><path d="M18.514 19.883a10.24 10.24 0 0 0 2.276-2.714l-8.834-5.1 6.558 7.814ZM1.911 10.298c-.1.575-.156 1.166-.156 1.77 0 .606.057 1.197.156 1.772l10.044-1.771-10.044-1.771Z" fill="currentColor"></path><path d="m11.956 12.07 3.488 9.587a10.193 10.193 0 0 0 3.067-1.774l-6.555-7.814Z" fill="currentColor"></path><path d="M11.956 12.069 22 13.84c.1-.575.156-1.166.156-1.771S22.1 10.873 22 10.298l-10.044 1.77Z" fill="currentColor"></path><path d="M20.79 6.969a10.283 10.283 0 0 0-2.276-2.714l-6.558 7.814 8.834-5.1Z" fill="#161b21"></path><path d="M11.956 12.07 22 10.297a10.11 10.11 0 0 0-1.213-3.33l-8.831 5.101Z" fill="currentColor"></path><path d="M3.124 6.969a10.17 10.17 0 0 0-1.212 3.329l10.044 1.771-8.832-5.1Z" fill="#161b21"></path><path d="m11.956 12.07 6.555-7.815a10.16 10.16 0 0 0-3.067-1.774l-3.488 9.588ZM11.956 12.07 8.466 2.48A10.25 10.25 0 0 0 5.4 4.255l6.556 7.814Z" fill="currentColor"></path><path d="M11.955 1.868c-1.226 0-2.4.216-3.488.613l3.488 9.588v-10.2Z" fill="#161b21"></path><path d="m11.956 12.069 3.49-9.588a10.158 10.158 0 0 0-3.488-.613V12.07h-.002Z" fill="currentColor"></path><path d="M13.26 17.058a5.085 5.085 0 1 0-2.308-9.904 5.085 5.085 0 0 0 2.309 9.904Z" fill="#161b21"></path></svg>} className={classes.reverse2}>
            <RoulettePlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>ROULETTE</span>
          </Button>
        </Link>
        <Link
          exact
          activeClassName={classes.subActiveJackpot}
          className={classes.subJackpot}
          to="/jackpot"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg style={{ fontSize: "18px", }} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-notch" className="svg-inline--fa fa-circle-notch fa-w-16 fa-fw" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z"></path></svg>} className={classes.reverse2}>
            <JackpotPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>JACKPOT</span>
          </Button>
        </Link>

        <Link
          exact
          activeClassName={classes.subActiveCoinflip}
          className={classes.subCoinflip}
          to="/coinflip"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg focusable="false" data-prefix="" data-icon="coin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="" style={{ width: "19px", marginLeft: "3px", marginRight: "3px", }}><g className="fa-group"><path fill="currentColor" d="M0 208C0 128.44 114.67 64 256 64s256 64.44 256 144-114.67 144-256 144S0 287.56 0 208z" className="fa-secondary"></path><path fill="currentColor" d="M0 320c0 27.77 18 53.37 48 74.33V330c-18.85-12-35.4-25.36-48-40.38zm80 92.51c27.09 12.89 59.66 22.81 96 28.8V377c-35.39-6-67.81-15.88-96-29zM464 330v64.32c30.05-21 48-46.56 48-74.33v-30.36C499.4 304.65 482.85 318 464 330zM336 441.31c36.34-6 68.91-15.91 96-28.8V348c-28.19 13.12-60.61 23-96 29zM208 381.2v64.09c15.62 1.51 31.49 2.71 48 2.71s32.38-1.2 48-2.71V381.2a477.2 477.2 0 0 1-48 2.8 477.2 477.2 0 0 1-48-2.8z" className="fa-primary"></path></g></svg>} className={classes.reverse2}>
            <CoinflipPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>COINFLIP</span>
          </Button>
        </Link>

        <Link
          exact
          activeClassName={classes.subActiveBattles}
          className={classes.subBattles}
          to="/battles"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg _ngcontent-ng-c4155593293="" fill="currentColor" enableBackground="new 0 0 512.001 512.001" viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg" style={{ width: "19px", marginLeft: "3px", marginRight: "3px", }} width="24" height="24" className="ng-star-inserted"><g _ngcontent-ng-c4155593293=""><path _ngcontent-ng-c4155593293="" d="m59.603 384.898h45v90h-45z" transform="matrix(.707 -.707 .707 .707 -279.94 183.975)"></path><path _ngcontent-ng-c4155593293="" d="m13.16 498.841c17.547 17.545 46.093 17.545 63.64 0l-63.64-63.64c-17.547 17.547-17.547 46.093 0 63.64z"></path><path _ngcontent-ng-c4155593293="" d="m384.898 407.398h90v45h-90z" transform="matrix(.707 -.707 .707 .707 -178.07 429.898)"></path><path _ngcontent-ng-c4155593293="" d="m435.201 498.841c17.547 17.545 46.093 17.545 63.64 0 17.547-17.547 17.547-46.093 0-63.64z"></path><path _ngcontent-ng-c4155593293="" d="m424.595 360.955-21.213-21.215 31.818-31.818c5.863-5.863 5.863-15.352 0-21.215-5.863-5.861-15.35-5.861-21.213 0l-127.278 127.28c-5.863 5.863-5.863 15.35 0 21.213 5.861 5.863 15.35 5.863 21.213 0l31.82-31.82 21.213 21.213z"></path><path _ngcontent-ng-c4155593293="" d="m128.722 277.214-19.102 19.102-10.607-10.607c-5.863-5.861-15.35-5.861-21.213 0-5.863 5.863-5.863 15.352 0 21.215l31.82 31.818-22.215 22.215 63.64 63.638 22.213-22.213 31.82 31.82c5.863 5.863 15.352 5.863 21.213 0 5.863-5.863 5.863-15.35 0-21.213l-10.605-10.607 19.102-19.102z"></path><path _ngcontent-ng-c4155593293="" d="m497.002.001h-84.853c-3.977 0-7.789 1.575-10.607 4.391l-124.329 124.33 106.066 106.066 124.329-124.331c2.818-2.816 4.393-6.628 4.393-10.605v-84.853c-.001-8.287-6.713-14.998-14.999-14.998z"></path><path _ngcontent-ng-c4155593293="" d="m110.459 4.392c-2.818-2.816-6.63-4.391-10.607-4.391h-84.853c-8.286 0-14.999 6.711-14.999 14.998v84.853c0 3.977 1.575 7.789 4.393 10.605l271.711 271.713 106.066-106.066z"></path></g></svg>} className={classes.reverse2}>
            <BattlesPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>BATTLES</span>
          </Button>
        </Link>

        <Link
          exact
          activeClassName={classes.subActiveBattles}
          className={classes.subBattles}
          to="/mines"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.9811 2.35316C18.1668 1.88228 18.8332 1.88228 19.0189 2.35316L19.6733 4.01242C19.73 4.15618 19.8438 4.26998 19.9876 4.32668L21.6468 4.98108C22.1177 5.16679 22.1177 5.83321 21.6468 6.01892L19.9876 6.67332C19.8438 6.73002 19.73 6.84382 19.6733 6.98758L19.0189 8.64684C18.8332 9.11772 18.1668 9.11772 17.9811 8.64684L17.3267 6.98758C17.27 6.84382 17.1562 6.73002 17.0124 6.67332L15.3532 6.01892C14.8823 5.83321 14.8823 5.16679 15.3532 4.98108L17.0124 4.32668C17.1562 4.26998 17.27 4.15618 17.3267 4.01242L17.9811 2.35316Z" fill="#707479"/>
  
  <path fill-rule="evenodd" clip-rule="evenodd" d="M17 14.5C17 18.6421 13.6421 22 9.5 22C5.35786 22 2 18.6421 2 14.5C2 10.3579 5.35786 7 9.5 7C13.6421 7 17 10.3579 17 14.5ZM12 16.75C12.4142 16.75 12.75 16.4142 12.75 16C12.75 15.5858 12.4142 15.25 12 15.25H10C9.58579 15.25 9.25 15.5858 9.25 16C9.25 16.4142 9.58579 16.75 10 16.75H12ZM14 12.5C14 13.3284 13.5523 14 13 14C12.4477 14 12 13.3284 12 12.5C12 11.6716 12.4477 11 13 11C13.5523 11 14 11.6716 14 12.5ZM9 14C9.55228 14 10 13.3284 10 12.5C10 11.6716 9.55228 11 9 11C8.44772 11 8 11.6716 8 12.5C8 13.3284 8.44772 14 9 14Z" fill="#707479"/>
  
  <path d="M16.7669 8.29386L16.0175 9.04328C15.6957 8.6594 15.3407 8.30436 14.9568 7.98261L15.7063 7.23315L16.4669 7.53312L16.7669 8.29386Z" fill="#707479"/>
</svg>
} className={classes.reverse2}>
            <MinesPlayAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>MINES</span>
          </Button>
        </Link>

        <br />

        <br />
        <Box style={{ borderBottom: "1px solid #161b21", }}></Box>
        <br />
        <span className={classes.category}>LEADERBOARD</span>
        <br /><br />

        <Link
          exact
          activeClassName={classes.subActiveRace}
          className={classes.subRace}
          to="/race"
          style={{ outline: "none", }}
        >
          <Button disableRipple startIcon={<svg style={{ fontSize: "17px", }} aria-hidden="true" focusable="false" data-prefix="far" data-icon="receipt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-inline--fa fa-receipt fa-w-16 fa-fw"><path fill="currentColor" d="M210.4 173.6c-50.8 0-86.1 10-114.4 22.1V102a56 56 0 1 0-64 0v388a22 22 0 0 0 22 22h20a22 22 0 0 0 22-22V298.7c28.3-12.1 63.6-22.1 114.4-22.1a144.77 144.77 0 0 1 29.6 3.26v-103a144.77 144.77 0 0 0-29.6-3.26zM240 374.82c39.58 8.25 77.24 29.4 128 31.38v-95c-50.76-2-88.42-23.13-128-31.38zM368 97.76a169.27 169.27 0 0 1-18.5 1c-37.32 0-70.17-16.92-109.5-27.17v105.23c39.58 8.25 77.24 29.4 128 31.38zm143.9 146.3v-84c-35.79 24.58-88.14 48.3-136.3 48.3-2.57 0-5.09-.07-7.6-.16v103c2.51.09 5 .16 7.6.16 48.2 0 100.6-23.76 136.4-48.36v-17.16c-.06-.57-.09-1.16-.1-1.78z" className="fa-primary"></path></svg>} className={classes.reverse2}>
            <RaceAmount />
            <span className={classes.reverse} style={{ marginRight: "32px", }}>RACE</span>
          </Button>
        </Link>

        {isLoading ? (
          <div className={classes.login}>
            <Skeleton
              height={36}
              width={120}
              animation="wave"
              variant="rect"
              style={{ marginRight: "1rem" }}
            />
            <Skeleton height={36} width={120} animation="wave" variant="rect" />
          </div>
        ) : isAuthenticated && user ? (
          <Box>
            <br />
            <Box style={{ borderBottom: "1px solid #161b21", }}></Box>
            <br />
            <Box style={{ display: "flex", }}>
              <span className={classes.category}>WALLET</span>
              <Box className={classes.freeinfo}>
              </Box>
            </Box>
            <br />

            <Box className={classes.subDeposit}>
              {isAuthenticated && user && (
                <Button onClick={() => setOpenDeposit(!openDeposit)} disableRipple startIcon={<svg style={{ fontSize: "17px", }} data-v-27f1f907="" data-v-98afd824="" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" className="material-design-icon__svg"><path data-v-27f1f907="" data-v-98afd824="" d="M2 12H4V17H20V12H22V17A2 2 0 0 1 20 19H4A2 2 0 0 1 2 17M11 5H13V8H16V10H13V13H11V10H8V8H11Z"><title data-v-27f1f907="" data-v-98afd824="">Tray Plus icon</title></path></svg>} className={classes.reverse2}>
                  DEPOSIT
                </Button>
              )}
            </Box>

            <Box className={classes.subWithdraw}>
              {isAuthenticated && user && (
                <Button disableRipple onClick={() => setOpenMarket(!openMarket)} startIcon={<svg style={{ fontSize: "17px", }} data-v-27f1f907="" data-v-98afd824="" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" className="material-design-icon__svg"><path data-v-27f1f907="" data-v-98afd824="" d="M16 10H8V8H16M2 17A2 2 0 0 0 4 19H20A2 2 0 0 0 22 17V12H20V17H4V12H2Z"><title data-v-27f1f907="" data-v-98afd824="">Tray Minus icon</title></path></svg>} className={classes.reverse2}>
                  WITHDRAW
                </Button>
              )}
            </Box>

            {/* <Link
              exact
              activeClassName={classes.subActiveAffiliate}
              to="/affiliates"
              style={{ outline: "none", }}
              className={classes.subAffiliate}>
              <Button disableRipple className={classes.reverse2}
                startIcon={<svg style={{ fontSize: "17px", }} aria-hidden="true" focusable="false" data-prefix="far" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-inline--fa fa-link fa-w-16 fa-fw"><path fill="currentColor" d="M314.222 197.78c51.091 51.091 54.377 132.287 9.75 187.16-6.242 7.73-2.784 3.865-84.94 86.02-54.696 54.696-143.266 54.745-197.99 0-54.711-54.69-54.734-143.255 0-197.99 32.773-32.773 51.835-51.899 63.409-63.457 7.463-7.452 20.331-2.354 20.486 8.192a173.31 173.31 0 0 0 4.746 37.828c.966 4.029-.272 8.269-3.202 11.198L80.632 312.57c-32.755 32.775-32.887 85.892 0 118.8 32.775 32.755 85.892 32.887 118.8 0l75.19-75.2c32.718-32.725 32.777-86.013 0-118.79a83.722 83.722 0 0 0-22.814-16.229c-4.623-2.233-7.182-7.25-6.561-12.346 1.356-11.122 6.296-21.885 14.815-30.405l4.375-4.375c3.625-3.626 9.177-4.594 13.76-2.294 12.999 6.524 25.187 15.211 36.025 26.049zM470.958 41.04c-54.724-54.745-143.294-54.696-197.99 0-82.156 82.156-78.698 78.29-84.94 86.02-44.627 54.873-41.341 136.069 9.75 187.16 10.838 10.838 23.026 19.525 36.025 26.049 4.582 2.3 10.134 1.331 13.76-2.294l4.375-4.375c8.52-8.519 13.459-19.283 14.815-30.405.621-5.096-1.938-10.113-6.561-12.346a83.706 83.706 0 0 1-22.814-16.229c-32.777-32.777-32.718-86.065 0-118.79l75.19-75.2c32.908-32.887 86.025-32.755 118.8 0 32.887 32.908 32.755 86.025 0 118.8l-45.848 45.84c-2.93 2.929-4.168 7.169-3.202 11.198a173.31 173.31 0 0 1 4.746 37.828c.155 10.546 13.023 15.644 20.486 8.192 11.574-11.558 30.636-30.684 63.409-63.457 54.733-54.735 54.71-143.3-.001-197.991z"></path></svg>}> AFFILIATES
              </Button>
            </Link> */}
          </Box>
        ) : (
          <Box>
          </Box>
        )}
        <br /><br />
      </Box>
    </Toolbar>
  );
};

HeaderNav.propTypes = {
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool,
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  user: state.auth.user,
});

export default connect(mapStateToProps, { logout })(HeaderNav);
