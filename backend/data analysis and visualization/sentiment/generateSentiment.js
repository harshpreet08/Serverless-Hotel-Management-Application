const functions = require('firebase-functions');
const admin = require('firebase-admin');
const language = require('@google-cloud/language');

admin.initializeApp();
const db = admin.firestore();
const client = new language.LanguageServiceClient();

exports.analyzeSentiment = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate(async (snap, context) => {
    console.log("--------- Function started ----- CLI trial ----");
    const feedback = snap.data();
    const document = {
      content: feedback.message,
      type: 'PLAIN_TEXT',
    };
    console.log("--------- Sentiment Calculation -------");
    const [result] = await client.analyzeSentiment({document});
    const sentiment = result.documentSentiment;
    console.log("Sentiments ----->");
    console.log(sentiment);
    return db.collection('feedbacks').doc(context.params.feedbackId).update({
      sentiment: sentiment,
    });
  });

