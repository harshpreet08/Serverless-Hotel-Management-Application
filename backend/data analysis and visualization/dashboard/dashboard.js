const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');

admin.initializeApp();
const db = admin.firestore();

const bigquery = new BigQuery();
const datasetId = 'LoginStats';
const tableId = 'Users';

exports.logLoginToBigQuery = functions.firestore
  .document('loginStatistics/{loginEmail}')
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    console.log("Data -----> ", data);

    if (data) {
      const email = data.email;
      const login = data.login ? data.login.toDate().toISOString() : null;
      const logout = data.logout ? data.logout.toDate().toISOString() : null;
      const times = data.times || 0;
      console.log("Generating Query -------> ");
      const query = `
        MERGE \`${datasetId}.${tableId}\` T
        USING (SELECT @email AS email, @login AS login, @logout AS logout, @times AS times) S
        ON T.email = S.email
        WHEN MATCHED THEN
          UPDATE SET login = S.login, logout = S.logout, times = S.times
        WHEN NOT MATCHED THEN
          INSERT (email, login, logout, times) VALUES(S.email, S.login, S.logout, S.times)
      `;

      const options = {
        query: query,
        params: {
          email: email,
          login: login,
          logout: logout,
          times: times,
        },
        location: 'US',
      };

      try {
        console.log("------ Starting Job --------");
        const [job] = await bigquery.createQueryJob(options);
        console.log(`Job ${job.id} started.`);
        const [rows] = await job.getQueryResults();
        console.log(`Job ${job.id} completed. Rows:`, rows);
      } catch (error) {
        console.error(`Failed to insert rows: ${error}`);
      }
    }
  });
