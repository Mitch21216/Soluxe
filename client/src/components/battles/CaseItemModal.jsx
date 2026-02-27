import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// MUI Components
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grow from '@material-ui/core/Grow';
import Tooltip from "@material-ui/core/Tooltip";

import backdropImgGold from "../../assets/csgold.webp";
import backdropImgRed from "../../assets/csred.webp";
import backdropImgPink from "../../assets/cspink.webp";
import backdropImgPurple from "../../assets/cspurple.webp";
import backdropImgBlue from "../../assets/csblue.webp";
import backdropImgLightBlue from "../../assets/cslightblue.webp";
import backdropImgWhite from "../../assets/cswhite.webp";

import { useEffect } from "react";

import RoundSkeleton from "../RoundSkeleton";

const useStyles = makeStyles(theme => ({
  withdrawitems: {
    display: "grid",
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gridGap: '20px 10px',
    "& > .item": {
      transform: "scale(1)",
      textAlign: "center",
      border: "1px solid #2f3947",
      borderRadius: "20px",
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 15px',
      boxSizing: 'border-box',
      "& > .metaData": {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        "& > .price": {
          fontSize: "17px",
          color: "#2196f3",
          height: "25px",
        },
        "& > .percentchance": {
          fontSize: "14px",
          cursor: "pointer",
          color: "#363a3f",
          height: "25px",
        },
      },
      "& > img": {
        maxWidth: "50%",
      },
      "& > span": {
        fontSize: "11px",
        display: "block",
      },
      "&:hover": {
        "& > img": {
          transform: "scale(1.1)",
          transition: "all 0.5s ease"
        },
      },
    },
  },
  modal: {
    "& div > div": {
      color: "#e4e4e4",
      fontFamily: "Rubik",
      fontSize: "14px",
      fontWeight: 500,
      "&::-webkit-scrollbar": {
        width: "6px",
        height: "0px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#3e4a59",
        borderRadius: "14px",
      },
      "&::-webkit-scrollbar-track": {
        borderRadius: "14px",
        background: "#1b2129",
      },
    },
    "& .MuiDialog-paperWidthSm": {
      //minWidth: "50%",
      transform: "scale(0.85)",
      width: "100%",
      maxWidth: '900px',
      background: "rgb(27, 33, 41)",
      border: "2px solid #2f3947",
      borderRadius: "20px",
      maxHeight: "calc(100%)",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        margin: "15px",
        marginTop: "75px",
        maxHeight: "82%",
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        margin: "15px",
        marginTop: "75px",
        maxHeight: "82%",
      },
      [theme.breakpoints.down("md")]: {
        width: "100%",
        margin: "15px",
        marginTop: "75px",
        maxHeight: "82%",
      },
    },
  },
  vipTitle: {
    fontFamily: "Rubik",
    fontSize: 20,
    textAlign: "right",
    marginTop: "2rem",
    marginRight: "1rem",
    "& > span": {
      color: "#e4e4e4",
      fontFamily: "Rubik",
    },
  },
  vipDesc: {
    width: "90%",
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: ".05em",
    marginTop: "30px",
    marginLeft: "20px",
    "& > a": {
      color: "#2196F3",
      fontFamily: "Rubik",
      fontSize: "14px",
      fontWeight: 500,
      letterSpacing: ".05em",
      textDecoration: "none",
    },
  },
  tradeurlinput: {
    borderRadius: "7px",
    marginLeft: "15px",
    padding: "7px",
    fontFamily: "Rubik",
    fontSize: "14px",
    color: "#fff",
    minWidth: "50%",
    fontWeight: 300,
    border: "2px solid #2f3947",
    background: "#1b2129",
    outline: "none",
  },
  buttonwithdraw: {
    color: "#fff",
    fontFamily: "Rubik",
    fontSize: "13px",
    fontWeight: 500,
    background: "#2196f3",
    "&:hover": {
      background: "#3888c8",
    },
  },
  withdrawLeft: {
    marginRight: "auto",
    marginLeft: "30px",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "10px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "10px",
    },
  },
  buttontest: {
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: ".1em",
  },
  header: {
    height: 'fit-content',
  },
  titlerubik: {
    fontFamily: "Rubik",
  },
  dropItem: {
    position: "relative",
    margin: 'auto 0',
    zIndex: 10,
  },
  dropActualImg: {
    height: "90px",
    inset: "0px",
    color: "transparent",
    zIndex: 10,
    objectFit: "contain",
  },
  dropBackground: {
    display: "flex",
    MozBoxAlign: "center",
    alignItems: "center",
    MozBoxPack: "center",
    justifyContent: "center",
    position: "absolute",
    inset: "0px",
    marginTop: "-15px",
    marginLeft: "5px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "-25px",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "-25px",
    },
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
    maxHeight: "80%",
    maxWidth: "80%",
    objectFit: "contain",
    zIndex: 0,
    height: "auto",
  },
  getTradeUrl: {
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 300,
    fontFamily: "Rubik",
    padding: "7px 9px",
    color: "#fff",
    background: "#2196f3",
    borderRadius: "5px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "11px",
      padding: "8px 7px",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "11px",
      padding: "8px 7px"
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "11px",
      padding: "8px 7px"
    },
  },
  progressbox: {
    margin: "0 1rem",
    position: "relative",
    "& > div > .MuiOutlinedInput-root": {
      "& > input": {},
    },
    "& > div": {
      width: "100%",
      "& label": {
        color: "#5f6368",
        fontFamily: "Rubik",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: ".1em",
      },
      "& label.Mui-focused": {
        color: "#5f6368",
      },
      "& .MuiInput-underline:after": {
        border: "1px solid #2f3947",
        borderRadius: "6px",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          border: "1px solid #2f3947",
          borderRadius: "6px",
        },
        "&:hover fieldset": {
          border: "1px solid #2f3947",
          borderRadius: "6px",
        },
        "&.Mui-focused fieldset": {
          border: "1px solid #2f3947",
          borderRadius: "6px",
        },
      },
    },
    "& > button": {
      position: "absolute",
      right: 10,
      top: 10,
      width: "7rem",
      background: "#1a90d1",
      color: "#ffffff",
      "&:hover": {
        background: "#1a90d1",
      },
      "& .MuiButton-label": {},
    },
    "& > img": {
      position: "absolute",
      top: -10,
      zIndex: 1000,
    },
  },
}));

const Battles = ({ open, handleClose, withItems, caseName, user }) => {
  // Declare State
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [caseDef, setCaseDef] = useState("");

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
    setLoading(true);
    if (withItems && withItems.length > 0) {
      setItems(withItems);
      setCaseDef(caseName)
    }
    setLoading(false);
  }, [withItems, caseName]);


  return (
    <Dialog
      className={classes.modal}
      onClose={handleClose}
      style={{ fontFamily: "Rubik" }}
      open={open}
    >
      <DialogTitle
        className={[classes.titlerubik, classes.header].join(' ')}
        onClose={handleClose}
        style={{ fontFamily: "Rubik" }}
      >  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: "rgb(23 138 201)", marginRight: "15px", marginBottom: "-3px", }} xmlns="http://www.w3.org/2000/svg"><path id="icon" fillRule="evenodd" clipRule="evenodd" d="M3.33335 5.46667V8.21667L1.25002 8.08333L0.833352 0H2.50002L3.33335 1.64167H7.50002L8.33335 0H11.6667L12.5 1.64167H16.6667L17.5 0H19.1667L18.75 8.08333L16.6667 8.21667V5.46667C16.6667 5.125 16.3834 4.84167 16.0417 4.84167H12.5L11.6667 6.025H8.33335L7.50002 4.84167H3.95835C3.61668 4.84167 3.33335 5.125 3.33335 5.46667ZM20 9.37499V10.7917C20 11.273 19.4395 11.7054 19.0509 12.0052C19.0157 12.0323 18.9818 12.0584 18.95 12.0833L19.925 19.1C19.9667 19.5833 19.5833 20 19.0917 20H17.4L16.375 19.0583L12.3333 20H7.66667L3.625 19.0583L2.6 20H0.908333C0.416667 20 0.0333333 19.5833 0.075 19.1L1.05 12.0917C1.01168 12.0608 0.970537 12.0284 0.927508 11.9946C0.540054 11.6894 0 11.2642 0 10.7917V9.37499L6.66667 9.58332V9.12499H6.675C6.7 8.68332 7.05833 8.33332 7.5 8.33332H12.5C12.9417 8.33332 13.3 8.68332 13.325 9.12499H13.3333V9.58332L20 9.37499ZM8.33333 9.58332C8.10833 9.58332 7.91667 9.76666 7.91667 9.99999V13.1417C7.91667 13.3 8.00833 13.4417 8.15 13.5083L9.69167 14.2833C9.88333 14.3833 10.1167 14.3833 10.3083 14.2833L11.85 13.5083C11.9917 13.4417 12.0833 13.3 12.0833 13.1417V9.99999C12.0833 9.77499 11.9 9.58332 11.6667 9.58332H8.33333ZM12.2833 17.5L16.5 16.4667C16.9 16.375 17.1667 16 17.1333 15.5917L17.1 15.1583L16.8917 12.4583H16.8833L16.8333 11.8333H13.3333V13.6583C13.3333 13.975 13.1583 14.2583 12.875 14.4L10.4167 15.625C10.3417 15.6667 10.1917 15.7167 10 15.7167C9.80833 15.7167 9.65833 15.6667 9.58333 15.625L7.125 14.4C6.84167 14.2583 6.66667 13.975 6.66667 13.6583V11.8333H3.15833L3.10833 12.4583L2.9 15.1583L2.86667 15.6417C2.83333 16.05 3.1 16.4167 3.5 16.5167L7.65 17.5L9.46667 17.9333C9.81667 18.0167 10.1833 18.0167 10.5333 17.925L12.2833 17.5Z" fill="currentColor"></path></svg>
        <span>
        {caseDef}
        </span>
      </DialogTitle>
      <DialogContent dividers style={{ background: "#181d24", padding: "20px 25px", }}>
        <Grow in timeout={420}>
          {loading ?
            <div className={classes.withdrawitems}><RoundSkeleton /></div> :
            <div className={classes.withdrawitems}>
              {items.length > 0
                ? items.sort((a, b) => b.price - a.price).map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      let currItems = items;
                      let indexItem = currItems
                        .map(i => {
                          return i.name;
                        })
                        .indexOf(item.name);

                      currItems[indexItem].selected = currItems[indexItem]
                        .selected
                        ? false
                        : true;

                      setItems([...currItems]);
                    }}
                    className="item"
                  >
                    <div className='metaData'>
                    <Tooltip title={"Tickets: " + item.ticketsStart + " - " + item.ticketsEnd} placement="bottom">
                      <span className="percentchance">
                        {parseFloat(item.chance.replace('%', '')).toFixed(2) + '%'}
                      </span>
                    </Tooltip>
                      <div className="price">$ {item.price.toFixed(2)}</div>
                    </div>

                    <div className={classes.dropItem}>
                      <img className={classes.dropActualImg} src={item.image} alt={item.name} draggable="false" decoding="async" data-nimg="fill" loading="lazy" />
                    </div>
                    
                    <div className={classes.dropBackground}>
                      <div className={classes.backdropWrapper} 
                        style={ item.color === "white" ? { filter: "drop-shadow(rgba(176, 195, 217, 1) 0px 0px 40px)", } 
                        : item.color === "lightblue" ? { filter: "drop-shadow(rgba(94, 152, 217, 1) 0px 0px 40px)", } 
                        : item.color === "blue" ? { filter: "drop-shadow(rgba(75, 105, 255, 1) 0px 0px 40px)", } 
                        : item.color === "purple" ? { filter: "drop-shadow(rgba(136, 71, 255, 1) 0px 0px 40px)", } 
                        : item.color === "pink" ? { filter: "drop-shadow(rgba(211, 46, 230, 1) 0px 0px 40px)", } 
                        : item.color === "red" ? { filter: "drop-shadow(rgba(228, 56, 56, 1) 0px 0px 40px)", } 
                        : { filter: "drop-shadow(rgb(255, 215, 0) 0px 0px 40px)", } }
                      >
                        <img className={classes.backdropImg} src={CheckItemColor(item.color)} alt="backdrop" decoding="async" data-nimg="1" loading="lazy" width="96" height="96" />
                      </div>
                    </div>

                    <span style={{ color: "#ea580c", margin: 'auto 0 0 0' }}>{item.stattrack === "Yes" ? "StatTrak™ " : ""}</span>
                    <span style={item.type === "Souvenir" ? { color: "#dfc643" } : { color: "#4A4E51" }}>{item.type}</span>
                      
                    <span>
                      {item.name}
                    </span>
                  </div>
                ))
                : null}

            </div>}
        </Grow>
      </DialogContent>
      <DialogActions>
        <Button
          disableRipple
          onClick={handleClose}
          className={classes.buttontest}
          color="primary"
        >
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

Battles.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Battles);