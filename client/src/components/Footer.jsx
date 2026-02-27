import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import { Link as NavLink } from "react-router-dom";

// MUI Components
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";

// Components
import ChatRulesModal from "./modals/ChatRulesModal";

// Assets
import logo from "../assets/crusadelogo.png";
import cards from "../assets/csgonew.png";
import age from "../assets/18.png";

const useStyles = makeStyles(theme => ({
  root: {
    background: "#191f26",
    display: "flex",
    height: "12rem",
    alignItems: "center",
    "& > div": {
      display: "flex",
      "& > div": {
        width: "100%",
        textAlign: "right",
        display: "flex",
        [theme.breakpoints.down("xs")]: {
          textAlign: "center",
        },
        "& :nth-child(1)": {
          color: "white",
        },
        "& > a": {
          color: "#707479",
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
  list: {
    flexDirection: "column",
    "& :nth-child(1)": {
      marginBottom: "1.5rem",
    },
    [theme.breakpoints.down("xs")]: {
      "&:nth-child(5)": {
        display: "none",
      },
    },
  },
  logo: {
    height: "5rem !important",
    [theme.breakpoints.down("xs")]: {
      display: "none !important",
    },
    "& img": {
      // height: "3rem",
      height: "3rem",
      width: "auto",
      marginRight: "15rem",
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
  },
  endRoot: {
    background: "#161b21",
    color: "#51555c",
    display: "flex",
    height: "5rem",
    alignItems: "center",
    justifyContent: "center",
    "& > div": {
      display: "flex",
    },
    "& .left": {
      display: "flex",
      flexDirection: "column",
    },
    "& .right": {
      display: "flex",
      marginLeft: "auto",
      color: "#51555c",
      alignItems: "center",
      "& img": {
        marginLeft: "1rem",
        opacity: 0.5,
      },
    },
  },
}));

const Footer = () => {
  const classes = useStyles();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Box>
      <Box className={classes.root}>
        <Container>
          <Box className={classes.logo}>
            <img src={logo} alt="logo" />
          </Box>
          <Box className={classes.list}>
            <Box>About</Box>
            <NavLink to="/fair">Fairness</NavLink>
            <NavLink to="/terms">Terms of Service</NavLink>
            <ChatRulesModal
              open={modalVisible}
              handleClose={() => setModalVisible(state => !state)}
            />
            <Link onClick={() => setModalVisible(state => !state)}>
              Chat Rules
            </Link>
          </Box>
          <Box className={classes.list}>
            <Box>Help</Box>
            <Link href="https://discord.gg/Gxv6eTtH2M" target="blank_">
              Support
            </Link>
            <NavLink to="/faq">FAQ</NavLink>
          </Box>
          <Box className={classes.list}>
            <Box>Social</Box>
            <Box style={{ display: "block", }}>
            <Link href="https://twitter.com/crusadedotgg" target="blank_" style={{ marginRight: "8px", }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" fill="none"><path fill="#9293A6" d="M28.945 32.043h-24c-2.208 0-4-1.861-4-4.154V4.196c0-2.293 1.792-4.154 4-4.154h24c2.208 0 4 1.86 4 4.154v23.693c0 2.293-1.792 4.154-4 4.154ZM13.233 25.1c7.544 0 11.672-6.497 11.672-12.122 0-.183 0-.366-.008-.548a8.545 8.545 0 0 0 2.048-2.21 8.076 8.076 0 0 1-2.36.672 4.262 4.262 0 0 0 1.808-2.36c-.792.491-1.672.84-2.608 1.031a4.025 4.025 0 0 0-2.992-1.346c-2.264 0-4.104 1.911-4.104 4.262 0 .333.04.657.104.973-3.408-.175-6.432-1.878-8.456-4.454a4.388 4.388 0 0 0-.552 2.144c0 1.479.728 2.783 1.824 3.547a4.033 4.033 0 0 1-1.856-.531v.058c0 2.06 1.416 3.789 3.288 4.179-.344.1-.704.15-1.08.15-.264 0-.52-.025-.768-.075.52 1.695 2.04 2.924 3.832 2.958a8.036 8.036 0 0 1-6.072 1.77 11.355 11.355 0 0 0 6.28 1.902Z"></path></svg>
            </Link>
            <Link href="https://discord.gg/Gxv6eTtH2M" target="blank_">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" fill="none"><path fill="#9293A6" d="M28.251 0H3.75A3.758 3.758 0 0 0 0 3.767v24.46a3.758 3.758 0 0 0 3.749 3.767h24.727c2.372 0 3.524-1.63 3.524-3.767V3.767A3.758 3.758 0 0 0 28.251 0Zm-7.058 23.881s-.658-.786-1.207-1.481c2.396-.677 3.31-2.176 3.31-2.176a10.47 10.47 0 0 1-2.103 1.079 12.03 12.03 0 0 1-2.651.786c-1.756.33-3.365.238-4.736-.018a15.36 15.36 0 0 1-2.688-.786c-.42-.165-.878-.366-1.335-.622-.055-.037-.11-.055-.165-.092a.252.252 0 0 1-.073-.054 6.422 6.422 0 0 1-.512-.311s.878 1.463 3.2 2.157c-.548.695-1.225 1.518-1.225 1.518-4.041-.128-5.577-2.78-5.577-2.78 0-5.887 2.633-10.66 2.633-10.66 2.633-1.975 5.138-1.92 5.138-1.92l.183.22c-3.291.95-4.809 2.395-4.809 2.395s.402-.22 1.079-.53c1.956-.86 3.51-1.097 4.15-1.152.11-.019.202-.037.312-.037a15.472 15.472 0 0 1 3.693-.036c1.737.2 3.603.713 5.504 1.755 0 0-1.444-1.371-4.553-2.322l.256-.293s2.505-.055 5.138 1.92c0 0 2.634 4.773 2.634 10.66 0 0-1.555 2.652-5.596 2.78Zm-8.503-8.54c-1.042 0-1.865.915-1.865 2.03 0 1.116.841 2.03 1.865 2.03 1.043 0 1.865-.914 1.865-2.03.019-1.115-.822-2.03-1.865-2.03Zm6.675 0c-1.043 0-1.866.915-1.866 2.03 0 1.116.842 2.03 1.866 2.03 1.042 0 1.865-.914 1.865-2.03 0-1.115-.823-2.03-1.865-2.03Z"></path></svg>
            </Link>
            </Box>
          </Box>
          <Box className={classes.list}>
            <Box>Payments</Box>
            <Box flexDirection="row">
              <a href="https://www.counter-strike.net/" target="_blank" rel="noreferrer"><img src={cards} alt="cards" style={{width: "32%"}} /></a>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box className={classes.endRoot}>
        <Container>
          <Box className="left">
            <span>Copyright © {new Date().getFullYear()} crusade.gg</span>
            <span>All Rights Reserved.</span>
          </Box>

          <Box className="right">
            <a
              href="https://www.begambleaware.org/"
              style={{ textDecoration: "none", color: "#353a5e" }}
            >
              <Box className="right">
                <img src={age} alt="age" />
              </Box>
            </a>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
