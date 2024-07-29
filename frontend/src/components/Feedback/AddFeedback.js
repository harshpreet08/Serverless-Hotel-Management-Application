import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Feedback = () => {
  const { propertyId } = useParams();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const {user} = auth  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const feedbackCollection = collection(db, "feedbacks");
      await addDoc(feedbackCollection, {
        propertyId,
        title,
        message,
        userId: user,
        timestamp: new Date()
      });
      toast.success('Feedback submitted successfully!');
      navigate(`/property-feedback/${propertyId}`);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Give Feedback
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="message"
          label="Message"
          type="text"
          id="message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit Feedback
        </Button>
      </Box>
      <ToastContainer />
    </Container>
  );
};

export default Feedback;
