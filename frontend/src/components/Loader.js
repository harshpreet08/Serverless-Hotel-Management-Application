
import { Box, CircularProgress } from "@mui/material";
import React from "react";


const Loader = () => {
  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
  );
};

export default Loader;