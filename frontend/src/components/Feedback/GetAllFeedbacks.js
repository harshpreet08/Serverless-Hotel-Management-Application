import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import Loader from "../Loader";

const GetAllFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const calculateSentiment = (sentimentScore) => {
    if(sentimentScore > 0.5){
      return <SentimentSatisfiedAltIcon fontSize="medium" />
    }
    else if(sentimentScore<0.5 && sentimentScore > -0.2){
      return <SentimentSatisfiedIcon fontSize="medium" />
    }
    return <SentimentVeryDissatisfiedIcon fontSize="medium" />
  }
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "https://zo46mxrxfujavfiouexrsbo7wy0ssgad.lambda-url.us-east-1.on.aws/"
        ); 
        console.log("Properties -->",response.data)
        const propertiesMap = response.data.reduce((map, property) => {
          map[property.property_id] = property;
          return map;
        }, {});
        setProperties(propertiesMap);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const feedbackCollection = collection(db, "feedbacks");
        const feedbackSnapshot = await getDocs(feedbackCollection);
        const feedbackList = feedbackSnapshot.docs.map((doc) => doc.data());
        setFeedbacks(feedbackList);
        setTimeout(() => setLoading(false), 2000);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchProperties();
    fetchFeedbacks();
  }, []);

  if (loading) {
    return <Loader />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Property Feedbacks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>Owner Id</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>User Id</TableCell>
              <TableCell>Sentiment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={`${feedback.propertyId}-${feedback.userId}`}>
                <TableCell>
                  {properties[feedback.propertyId]?.property_name || "N/A"}
                </TableCell>
                <TableCell>
                  {properties[feedback.propertyId]?.agent_id || "N/A"}
                </TableCell>
                <TableCell>{feedback.message}</TableCell>
                <TableCell>{feedback.userId}</TableCell>
                <TableCell>
                  {feedback.sentiment
                    ? calculateSentiment(feedback.sentiment.score)
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default GetAllFeedbacks;
