import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core";
import { NavLink as Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { changeWallet } from "../actions/auth";

import parseCommasToThousands from "../utils/parseCommasToThousands";

import { getUserProfileData, getUserVipData, claimRakebackBalance } from "../services/api.service";
import { logout } from "../actions/auth";

import { useToasts } from "react-toast-notifications";

// MUI Components
//import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Grow from '@material-ui/core/Grow';

import error from "../assets/error.wav";



import Vip from "../components/modals/VIPModal";

// Components
import AccountVerificationModal from "../components/modals/AccountVerificationModal";
import ProgressBar from 'react-bootstrap/ProgressBar'


// Images
import bgGradient1 from "../assets/home/bgGradient1.png";
import bgGradient2 from "../assets/home/bgGradient2.png";
import bgButton from "../assets/home/bgButton.png";

import blueCornerTopLeft from "../assets/home/blueCornerTopLeft.png";
import purpleCornerTopLeft from "../assets/home/purpleCornerTopLeft.png";

import coin from "../assets/home/coin.png";

import blueStar from "../assets/home/blueStar.png";
import purpleStar from "../assets/home/purpleStar.png";

import battlesIcon from "../assets/home/battlesIcon.png";
import jackpotIcon from "../assets/home/jackpotIcon.png";
import coinflipIcon from "../assets/home/coinflipIcon.png";
import rouletteIcon from "../assets/home/rouletteIcon.png";
import crashIcon from "../assets/home/crashIcon.png";

const errorAudio = new Audio(error);

const playSound = audioFile => {
  audioFile.play();
};


// Custom styles
const useStyles = makeStyles(theme => ({
  profile: {
    margin: "0rem",
    color: "#e0e0e0",
    [theme.breakpoints.down("sm")]: {
      margin: "2rem 0",
    },
    "& > h1": {
      color: "#e4e4e4",
      fontFamily: "Rubik",
      fontSize: "20px",
      fontWeight: 500,
      letterSpacing: ".1em",
      margin: 0,
      marginBottom: "1rem",
    },
  },
  userWrap: {
    display: "flex",
    borderRadius: "10px",
    padding: "1rem",
  },
  user: {
    display: "flex",
    flexDirection: "column",
    "& > h1": {
      margin: 0,
      color: "#e0e0e0",
      fontFamily: "Rubik",
      fontSize: "16px",
      fontWeight: 500,
      letterSpacing: ".05em",
    },
    "& > h5": {
      margin: 0,
      textTransform: "uppercase",
      color: "#e0e0e0",
      fontFamily: "Rubik",
      fontSize: "13px",
      fontWeight: 500,
      letterSpacing: ".05em",
    },
  },
  buttontest: {
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: ".1em",
  },
  pfp: {
    height: "70px",
    width: "70px",
    borderRadius: "100%",
  },
  logoutt: {
    textAlign: "left",
    marginLeft: "160px",
  },
  dangerzone: {
    background: "#191f26",
    border: "1px solid #161b21",
    borderRadius: "10px",
    padding: "20px",
  },
  bet: {
    minWidth: "fit-content",
    textAlign: "center",
    backgroundColor: "#1b2129",
    boxShadow: "none",
    color: "white",
    marginLeft: "-90px",
    textTransform: "capitalize",
    "&:hover": {
      backgroundColor: "#1b2129",
      boxShadow: "none",
    },
  },
  rewardBanner: {
    borderRadius: "2.69px",
    backgroundColor: '#171a1e7a', // El color de fondo que desees
    backgroundImage: `url(${bgGradient2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: "100%",
    display: "flex",
    padding: "20px 40px",
  },
  rewardBannerBg: {
    padding: "5px !important",
    border: "solid 2px #1E232E",
  },
  userBanner: {
    borderRadius: "2.69px",
    backgroundColor: '#1A1E26', // El color de fondo que desees
    backgroundImage: `url(${bgGradient1})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: "100%",
    display: "flex",
    padding: "40px",
  },
  userBannerBg: {
    padding: "5px !important",
    border: "solid 2px #1E232E",
  },
  grid: {
    flexWrap: "nowrap",
    justifyContent: "space-between",
    margin: "1rem 0 2rem",
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap",
      flexDirection: "column",
    },
    "& > div": {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      background: "#1b2129",
      borderRadius: "10px",
      border: "2px solid #2f3947",
      width: "19%",
      height: "7rem",
      padding: "0 2rem",
      color: "#9d9d9d",
      fontFamily: "Rubik",
      fontSize: "13px",
      fontWeight: 500,
      letterSpacing: ".05em",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        marginBottom: 10,
      },
      "& svg": {
        marginRight: "0.25rem",
        color: "#2196f3",
      },
      "& h1": {
        margin: 0,
        filter: "drop-shadow(1px 2px 20px blue) invert(25%)",
        color: "#e0e0e0",
        fontFamily: "Rubik",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: ".05em",
      },
    },
  },
  tran: {
    background: "#1b2129",
    borderRadius: "10px",
    border: "2px solid #2f3947",
    padding: "2rem",
    paddingTop: "1rem",
    maxHeight: "23rem",
    overflowY: "auto",
    [theme.breakpoints.down("xs")]: {
      padding: "1rem",
    },
    "& th": {
      borderBottom: "none",
      color: "#2196f3",
      fontFamily: "Rubik",
      fontSize: "14px",
      fontWeight: 500,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      paddingLeft: 0,
    },
    "& td": {
      borderBottom: "1px #2f3947 solid",
      background: "#1b2129",
      color: "#9d9d9d",
      fontFamily: "Rubik",
      fontSize: "13px",
      fontWeight: 500,
      letterSpacing: ".05em",
      paddingLeft: 0,
      "&:nth-child(1)": {
        paddingLeft: "1rem",
      },
      "&:nth-child(n+1):nth-child(-n+3)": {
        color: "#9d9d9d",
        fontFamily: "Rubik",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: ".05em",
      },
    },
  },
  notVerified: {
    background: "#272b2f",
    boxShadow: "0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)",
    color: "#e0e0e0",
    fontFamily: "Rubik",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: ".05em",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: "1rem",
    borderRadius: "0.25rem",
    [theme.breakpoints.down("xs")]: {
      padding: "1rem",
    },
    "& > div": {
      margin: "0 auto 0 0",
      display: "flex",
      alignItems: "center",
    },
    "& svg": {
      marginRight: "1rem",
      color: "#2196f3",
    },
  },
  verifyBtn: {
    backgroundColor: "#273a4f",
    borderColor: "#273a4f",
    color: "#e0e0e0",
    fontFamily: "Rubik",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: ".1em",
    padding: "0.3rem 2rem",
    textTransform: "capitalize",
    marginLeft: "1rem",
    "&:hover": {
      backgroundColor: "#273a4f",
    },
  },
  reverse: {
    fontFamily: "Rubik",
  },
  nonenav: {
    color: "#d5d6d8",
    fontSize: "11px",
    fontFamily: "Rubik",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  bronzenav: {
    color: "#C27C0E",
    fontSize: "11px",
    fontFamily: "Rubik",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  silvernav: {
    color: "#95A5A6",
    fontSize: "11px",
    fontFamily: "Rubik",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  goldnav: {
    color: "#b99309",
    fontSize: "11px",
    fontFamily: "Rubik",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  diamondnav: {
    color: "#3498DB",
    fontSize: "11px",
    fontFamily: "Rubik",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  progressbox: {
    position: "relative",
    "& > div > .MuiOutlinedInput-root": {
      background: "#1b2129",
      "& > input": {
        color: "#cccc",
        fontFamily: "Rubik",
        marginRight: "100px",
        fontSize: "14px",
      },
    },
    "& > div": {
      width: "100%",
      "& label": {
        color: "#ff9800",
        fontFamily: "Rubik",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: ".1em",
      },
      "& label.Mui-focused": {
        color: "#ff9800",
      },
      "& .MuiInput-underline:after": {
        border: "1px solid #2f3947",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          border: "1px solid #2f3947",
        },
        "&:hover fieldset": {
          border: "1px solid #2f3947",
        },
        "&.Mui-focused fieldset": {
          border: "1px solid #2f3947",
        },
      },
    },
    "& > button": {
      position: "absolute",
      right: 10,
      top: 10,
      width: "7rem",
      background: "#264d68",
      color: "#e4e4e4",
      "&:hover": {
        background: "#264d68",
      },
      "& .MuiButton-label": {
      },
    },
    "& > img": {
      position: "absolute",
      top: -10,
      zIndex: 1000,
    },
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "36rem",
  },
  noTransactions: {
    width: "100%",
    textAlign: "center",
    padding: "2rem 0 1rem 0",
    color: "#9d9d9d",
    fontFamily: "Rubik",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: ".1em",
  },
  verifybutton: {
    color: "#5f6368",
  },
  avatar: {
    width: "35px",
    height: "35px",
    position: "relative",
    padding: "2px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  avatarimg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
  },
  avatarimg2: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    position: "relative",
    WebkitUserDrag: "none",
  },
  level: {
    width: "27px",
    height: "27px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: "-2px",
    bottom: "-2px",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "500",
    backgroundColor: "#333b42",
    border: "2px solid #242b33",
    borderRadius: "50px",
    paddingTop: "2px",
  },
  userinfo: {
    display: "flex",
    flexDirection: "column",
    gridGap: "4px",
  },
  welcomeText: {
    fontSize: "14.816px",
    fontWeight: "700",
    // fontFamily: "Poppins",
    "& > span": {
      color: "#5EB1FF",
    }
  },
  level1: {
    height: "24px",
    position: "absolute", 
    padding: "2px 8px 2px 4px", 
    display: "flex", 
    alignItems: "center",   
    borderRadius: '3.52px',
    border: '1.344px solid #0e8bffa6', // Se agregó 'solid' para que el estilo del borde sea válido
    background: 'rgb(76 70 70 / 10%)',
    // boxShadow: '0px 0px 3.84px 7.68px rgba(0, 0, 0, 0.15), 0px 0px 4.693px 1.173px rgba(14, 139, 255, 0.55)',
    backdropFilter: 'blur(7px)',
    boxShadow: "inset 0px 0px 11px 0px rgb(60 122 199 / 60%)",
    filter: "drop-shadow(0px 0px 10px #2ca4d3)",
  },

  level2: {
    height: "24px",
    position: "absolute", 
    right: "0px",
    padding: "2px 8px 2px 4px", 
    display: "flex", 
    alignItems: "center",   
    borderRadius: '3.52px',
    border: '1.344px solid #e867ff73', // Se agregó 'solid' para que el estilo del borde sea válido
    background: 'rgb(76 70 70 / 10%)',
    // boxShadow: '0px 0px 3.84px 7.68px rgba(0, 0, 0, 0.15), 0px 0px 4.693px 1.173px rgba(14, 139, 255, 0.55)',
    backdropFilter: 'blur(7px)',
    boxShadow: "inset 0px 0px 11px 0px rgb(129 60 199 / 60%)",

  },

  buttonRake: {
    display: "flex", 
    borderRadius: "2.5px", 
    padding: "0px 10px", 
    alignItems: "center", 
    fontFamily: "Rubik",
    background: "#4BF971", 
    color: "#226C32", 
    fontWeight: "600 !important",     
    borderBottom: '4px solid #2A6C29', 
    boxShadow: "rgb(0 0 0 / 60%) 0px 0px 11px 0px inset",
    "&:hover" : {
      background: "#8affa4", 
      transform: "scale(1.05)", // Agranda el contenedor un poco al hacer hover

    }
  },
  coin: {
    '@media (max-width: 1610px)': { // Media query para pantallas pequeñas
      display: "none",
    },
  },

  bannerGames: {
    width: "100%",
    height: "255px",
    background: "#171820",
    backgroundSize: "cover",
    borderRadius: "9px",
    position: "relative",
    boxSizing: "border-box",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));",
    transition: "transform 0.3s ease, box-shadow 0.3s ease", // Añade transición para el hover
    "&::before": {
      content: '""',
      position: "absolute",
      top: -1.5,
      left: -1.5,
      right: -1.5,
      bottom: -1.5,
      borderRadius: "9px",
      backgroundImage: "linear-gradient(to top, #AABAFF, #171820)", // El gradiente que va de abajo hacia arriba
      zIndex: -1, // Asegura que el borde esté detrás del contenido
      transition: "background-image 0.3s ease", // Añade transición al gradiente
    },
    "&:hover": {
      transform: "scale(1.05)", // Agranda el contenedor un poco al hacer hover
      boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.35)", // Aumenta la sombra al hacer hover
      "&::before": {
        backgroundImage: "linear-gradient(to top, #AABAFF, #171820)" // Cambia el gradiente al hacer hover
      }
    },
  },
  circularProgress: {
    color: "#5EB1FF",
    position: "absolute", 
    width: "49px !important", 
    height: "49px !important", 
    top: "-5px", 
    right: "-5px",
    '& .MuiCircularProgress-root': {
      transform: 'rotate(180deg) !important', // Rotar el progreso
    },
    '& .MuiCircularProgress-circle': {
      strokeWidth: '1px',
    },
  },

  ProgressBar: {
    height: "unset",
    background: "unset",
    '& .progress-bar': {
      height: "12.5px", background: "linear-gradient(90deg, #4492ED -0.58%, rgba(141, 64, 218, 0.90) 68.88%)", borderRadius: "4.5px",
    },
    '& .progress-bar-animated': {
      animation: "unset"
    },
    
  }
  

}));

// Custom Component
const ColorCircularProgress = withStyles({
  root: {
    color: "#5EB1FF",
  },
})(CircularProgress);

const Home = ({ isLoading, isAuthenticated, user, logout }) => {
  // Declare State
  const classes = useStyles();
  const { addToast } = useToasts();
  const [displayname, setDisplayname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

  // eslint-disable-next-line
  const [profile, setProfile] = useState(null);
  const [openVip, setOpenVip] = useState(false);
  // eslint-disable-next-line
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [vipData, setVipData] = useState(null);
  // eslint-disable-next-line
  const [vipDataColor, setVipDataColor] = useState(null);
  // eslint-disable-next-line
  const [vipDataName, setVipDataName] = useState(null);
  // eslint-disable-next-line
  const open = Boolean(anchorEl);


  // Claim user vip rakeback
  const claimRakeback = async () => {
    setClaiming(true);
    try {
      const response = await claimRakebackBalance();

      changeWallet({ amount: response.rakebackClaimed });
      addToast(
        "Successfully claimed Rakeback!",
        { appearance: "success" }
      );
      const data = await getUserVipData();
      setVipData(data);
      //console.log(claiming);
    } catch (error) {
      setClaiming(false);
      //console.log(
      //  "There was an error while claiming user rakeback balance:",
      //  error
      //);
      // If this was user error
      if (error.response && error.response.data && error.response.data.error) {
        addToast(error.response.data.error, { appearance: "error" });
        playSound(errorAudio);
      } else {
        //window.location.replace("/Update");
        console.log(claiming); // delete this, its useless
      }
    }
  };




  // componentDidMount
  useEffect(() => {
    // Get profile data from API
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getUserProfileData();
        setProfile(data);
        const data2 = await getUserVipData();
        setVipData(data2);
        const currentMajorLevel = data2.majorLevelNames.find((levelName, index) => {
          const currentLevelIndex = data2.allLevels.findIndex((level) => level.name === data2.currentLevel.name);
          const nextIndex = data2.allLevels.findIndex((level) => level.levelName === data2.majorLevelNames[index + 1]);
          if (currentLevelIndex >= index && (nextIndex === -1 || currentLevelIndex < nextIndex)) {
            return true;
          }
          return false;
        });
        const currentMajorLevelIndex = data2.majorLevelNames.indexOf(currentMajorLevel);
        setVipDataColor(data2.majorLevelColors[currentMajorLevelIndex]);
        setVipDataName(currentMajorLevel);

        setDisplayname(data.username);
        setAvatar(data.avatar)
        setLoading(false);
      } catch (error) {
        console.log("There was an error while loading user profile data:", error);
      }
    };
    if (!isLoading && isAuthenticated) {
      fetchData();
    }

  }, [isLoading, isAuthenticated]);

  

  return isLoading && !user ? (
    <Box className={classes.loader}>
      <ColorCircularProgress />
    </Box>
  ) : (
    <Box style={{ margin: "10px", }}>
      <AccountVerificationModal
        open={modalVisible}
        handleClose={() => setModalVisible(state => !state)}
      />
      <Vip handleClose={() => setOpenVip(!openVip)} open={openVip} />
      <Box>
        <Container maxWidth="lg">
          <Grow in timeout={620}>
            <Box className={classes.profile}>
              
              <Box className={classes.userWrap} style={{ backgroundColor: "#1b2129", marginTop: "50px"}}>
                <Box className={classes.user} width={"100%"}>
                
                    {isAuthenticated ?
                                      <Grid container spacing={2}>

                     <Grid item xs={12} sm={6}>
                     <Box style={{position: "relative", height: "100%"}} className={classes.userBannerBg}>
                       <Box style={{display: "flex", flexDirection: "column"}} className={classes.userBanner}>
                         <Box style={{display: "flex", flexDirection: "row"}}>
                           {loading ? (
                           <Box style={{width: "39px", height: "39px", marginRight: "10px", background: `white`, borderRadius: "400px"}}></Box>
                         ) : (
                           <Box className={classes.avatar} style={{
                             width: "39px", height: "39px", marginRight: "15px",
                           }}>
                             <CircularProgress style={{}} classes={{ root: classes.circularProgress }} variant="determinate" value={((vipData?.wager - vipData?.currentLevel?.wagerNeeded) / (vipData?.nextLevel?.wagerNeeded - vipData?.currentLevel?.wagerNeeded)) * 100} />

                             <Box className={classes.avatarimg}>
                               <img className={classes.avatarimg2} id="avatar-img" alt="Avatar" src={avatar} />
                             </Box>
                           </Box>)}
                           <Box style={{display: "flex", flexDirection: "column", width: "-webkit-fill-available",}}>
                               <span className={classes.welcomeText}>Welcome back, <span>{!isLoading && !isAuthenticated ? "" : displayname}</span></span>
                               <Box style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                 <span style={{fontSize: "11px", opacity: "0.5",}}>Your level Progress</span>
                                 <span style={{fontSize: "13px", fontWeight: "bold"}}>{vipData?.wager.toFixed(2)} $<span style={{opacity: "0.56",}}>/{vipData?.nextLevel?.wagerNeeded} $</span></span>
                               </Box>
                           </Box>
                         </Box>
                         <Box style={{position: "relative", height: "18px", backgroundColor: "#16191D", width: "-webkit-fill-available", borderRadius: "4.5px", display: "flex", alignItems: "center", marginTop: "20px"}}>
                         {/* <Box style={{height: "12.5px", background: "linear-gradient(90deg, #4492ED -0.58%, rgba(141, 64, 218, 0.90) 68.88%)", width: "76%", borderRadius: "4.5px"}}></Box> */}
                           <ProgressBar className={classes.ProgressBar} style={{ borderRadius: "5px", width: "100%"}}
                             variant="success"
                             animated
                             min={vipData?.currentLevel?.wagerNeeded}
                             max={vipData?.nextLevel?.wagerNeeded}
                             now={vipData?.wager}
                           />
                           <Box className={classes.level1}>
                             <img style={{width: "15.5px"}} src={blueStar} alt="" />
                             <span style={{fontSize: "11px", fontWeight: "bold", marginLeft: "3px", paddingTop: "1px"}}>{vipData?.currentLevel.name}</span>
                           </Box>
                           <Box className={classes.level2}>
                             <img style={{width: "15.5px"}} src={purpleStar} alt="" />
                             <span style={{fontSize: "11px", fontWeight: "bold", marginLeft: "3px", paddingTop: "1px"}}>{parseFloat(vipData?.currentLevel.name)+1}</span>
                           </Box>
                         </Box>
                       </Box>

                       <img style={{ position: "absolute", top: "-3px", left: "-3px"}} src={blueCornerTopLeft} alt="" />
                       <img style={{ position: "absolute", bottom: "-3px", left: "-3px", transform: "scaleX(-1) rotate(180deg)"}} src={blueCornerTopLeft} alt="" />
                       <img style={{ position: "absolute", right: "-3px", top: "-3px", transform: "scaleX(-1) rotate(0deg)"}} src={blueCornerTopLeft} alt="" />
                       <img style={{ position: "absolute", right: "-3px", bottom: "-3px", transform: "scaleX(+1) rotate(180deg)"}} src={blueCornerTopLeft} alt="" />

                     </Box>
                   </Grid>
                    <Grid item xs={12} sm={6}>
                    <Box style={{position: "relative", height: "100%"}} className={classes.rewardBannerBg}>
                      <Box style={{display: "flex", flexDirection: "column"}} className={classes.rewardBanner}>
                        <Box style={{display: "flex", flexDirection: "row"}}>
                          <Box style={{display: "flex", flexDirection: "column", width: "-webkit-fill-available", gap: "10px"}}>
                              <span className={classes.welcomeText}>REWARDS</span>
                              <Box style={{display: "flex", flexDirection: "column",}}>
                                <span style={{fontSize: "12px", opacity: "0.5",}}>Increase your tier to earn more coins!</span>
                                <span style={{fontSize: "12px", color: "rgb(255 255 255 / 50%)",}}>You currently earn <span style={{color: "#4BF971", fontWeight: "600", opacity: "1", textShadow: "0px 0px 10px #4bf9717d"}}>{vipData?.currentLevel.rakebackPercentage}%</span> rakeback on all bets.</span>
                                <Box style={{display: "flex", flexDirection: "row", gap: "10px", marginTop: "15px"}}>
                                  <div style={{background: "#15181C", width: "fit-content", padding: "12px 12px", borderRadius: "2.5px"}}>
                                    <span style={{fontSize: "14px", fontWeight:"500"}}>
                                      $
                                      {parseCommasToThousands(
                                        (vipData?.rakebackBalance != null
                                          ? vipData.rakebackBalance.toFixed(2)
                                          : '0.00')
                                      )}
                                      </span>
                                    {/* <span style={{fontSize: "11px", fontWeight:"500", color: "#787D9C",}}>.65</span> */}
                                  </div>
                                  <Button
                                    className={classes.buttonRake}
                                    onClick={claimRakeback}
                                  >
                                    CLAIM RAKEBACK
                                  </Button>
                                  
                                </Box>
                              </Box>
                          </Box>
                          <Box>
                            <img style={{position: "absolute", bottom: "1px", right: "0",}} className={classes.coin} src={coin} alt="" />
                          </Box>
                        </Box>
                      </Box>

                      <img style={{ position: "absolute", top: "-9px", left: "-9px"}} src={purpleCornerTopLeft} alt="" />
                      <img style={{ position: "absolute", bottom: "-9px", left: "-9px", transform: "scaleX(-1) rotate(180deg)"}} src={purpleCornerTopLeft} alt="" />
                      <img style={{ position: "absolute", right: "-9px", top: "-9px", transform: "scaleX(-1) rotate(0deg)"}} src={purpleCornerTopLeft} alt="" />
                      <img style={{ position: "absolute", right: "-9px", bottom: "-9px", transform: "scaleX(+1) rotate(180deg)"}} src={purpleCornerTopLeft} alt="" />

                    </Box>
                  </Grid>
                  <div style={{background: "linear-gradient(90deg, rgba(67,79,140,0) 0%, rgba(67,79,140,1) 50%, rgba(67,79,140,0) 100%)", width: "100%", height: "2px", margin: "50px 0"}}></div>

                  </Grid>

                    : ""}
                   
                    
                    

                  


                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Link to="battles">
                        <Button className={classes.bannerGames}>
                          <img style={{position: "absolute", borderRadius: "9px", width: "100%", height: "100%", zIndex: "0", background: "#171820"}} src={bgButton} alt="" />
                          <div style={{position: "absolute", borderRadius: "0 0 9px 9px", background: "#12131A", bottom: "0px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                            <span style={{fontFamily: "Rubik", fontSize: "13.4px", color: "white", fontWeight: "600", textTransform: "none"}}>Battles</span>
                            <img src={battlesIcon} alt="" />
                          </div>
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Link to="jackpot">
                        <Button className={classes.bannerGames}>
                          <img style={{position: "absolute", borderRadius: "9px", width: "100%", height: "100%", zIndex: "0", background: "#171820"}} src={bgButton} alt="" />
                          <div style={{position: "absolute", borderRadius: "0 0 9px 9px", background: "#12131A", bottom: "0px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                            <span style={{fontFamily: "Rubik", fontSize: "13.4px", color: "white", fontWeight: "600", textTransform: "none"}}>Jackpot</span>
                            <img src={jackpotIcon} alt="" />
                          </div>
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Link to="coinflip">
                        <Button className={classes.bannerGames}>
                          <img style={{position: "absolute", borderRadius: "9px", width: "100%", height: "100%", zIndex: "0", background: "#171820"}} src={bgButton} alt="" />
                          <div style={{position: "absolute", borderRadius: "0 0 9px 9px", background: "#12131A", bottom: "0px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                            <span style={{fontFamily: "Rubik", fontSize: "13.4px", color: "white", fontWeight: "600", textTransform: "none"}}>Coinflip</span>
                            <img src={coinflipIcon} alt="" />
                          </div>
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Link to="roulette">
                        <Button className={classes.bannerGames}>
                          <img style={{position: "absolute", borderRadius: "9px", width: "100%", height: "100%", zIndex: "0", background: "#171820"}} src={bgButton} alt="" />
                          <div style={{position: "absolute", borderRadius: "0 0 9px 9px", background: "#12131A", bottom: "0px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                            <span style={{fontFamily: "Rubik", fontSize: "13.4px", color: "white", fontWeight: "600", textTransform: "none"}}>Roulette</span>
                            <img src={rouletteIcon} alt="" />
                          </div>
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Link to="crash">
                        <Button className={classes.bannerGames}>
                          <img style={{position: "absolute", borderRadius: "9px", width: "100%", height: "100%", zIndex: "0", background: "#171820"}} src={bgButton} alt="" />
                          <div style={{position: "absolute", borderRadius: "0 0 9px 9px", background: "#12131A", bottom: "0px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                            <span style={{fontFamily: "Rubik", fontSize: "13.4px", color: "white", fontWeight: "600", textTransform: "none"}}>Crash</span>
                            <img src={crashIcon} alt="" />
                          </div>
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>


                  <br />

                  
                </Box>
              </Box>
              
              <br />
              <br />
              <br />
              <br />
            </Box>
          </Grow>
        </Container>
      </Box>
    </Box>
  );
};



Home.propTypes = {
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool,
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  user: state.auth.user,
  logout: PropTypes.func.isRequired,
});

export default connect(mapStateToProps, { logout })(Home);
