import React, { useEffect, useState } from "react";
import {useParams } from "react-router-dom";
import { Container, Typography, Paper, Grid, CircularProgress } from "@mui/material";

import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Loader from "../Loader";

const PropertyFeedback = () => {
  const [loading,setLoading] = useState(true)
  const [feedbacks,setFeedbacks] = useState();
  const { propertyId } = useParams();
  useEffect(()=>{
 
    const fetchFeedback = async (propertyId) => {
        const feedbacksCollection = collection(db, "feedbacks");
        const q = query(feedbacksCollection, where("propertyId", "==", propertyId));
        const feedbackSnapshot = await getDocs(q);
        setFeedbacks(feedbackSnapshot.docs.map((doc) => doc.data()))
        setTimeout(()=>{
         console.log(feedbacks);
          setLoading(false)
        },3000)
        
      };

    fetchFeedback(propertyId);
  },[])

  if(loading){
    return <Loader />
  }
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Property Feedback
      </Typography>
      {feedbacks.length === 0 ? (
        <Typography variant="body1" component="p">
          No feedback available for this property.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {feedbacks.map((feedback, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" component="h2">
                  {feedback.title}
                </Typography>
                <Typography variant="body2" component="p">
                  {feedback.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted by: {feedback.userId} on {new Date(feedback.timestamp.seconds * 1000).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PropertyFeedback;
