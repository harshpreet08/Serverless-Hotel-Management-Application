
const firebaseConfig = {
    apiKey: "AIzaSyDLTPrS8gcvCW76TOEhBky7NTMSGt01VfU",
    authDomain: "serverless-project-427212.firebaseapp.com",
    databaseURL: "https://serverless-project-427212-default-rtdb.firebaseio.com",
    projectId: "serverless-project-427212",
    storageBucket: "serverless-project-427212.appspot.com",
    messagingSenderId: "996482586248",
    appId: "1:996482586248:web:8201f151974b3e13f4f13d",
    measurementId: "G-5XXESZCV71"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const database = firebase.database();
firestore.settings({ experimentalForceLongPolling: true, merge: true });

function showMessagesPreview() {
    currentUserEmail = localStorage['username']; 

    firestore.collection('chat-messages')
    .get()
    .then(querySnapshot => {
        const messagesPreview = document.getElementById('messagesPreview');
        messagesPreview.innerHTML = '';

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const messages = data.messages || [];
            
            const relevantMessages = messages.filter(message => {
                return message.receiver_id === currentUserEmail || message.sender_id === currentUserEmail;
            });
            console.log(messages, relevantMessages)
            if (relevantMessages.length > 0) {
                const lastMessage = relevantMessages[relevantMessages.length - 1].content;
                let otherRecipientId = relevantMessages[relevantMessages.length - 1].sender_id;

                const messageButton = document.createElement('button');
                messageButton.textContent = `${otherRecipientId}: ${lastMessage}`;

                if(otherRecipientId === currentUserEmail)
                    otherRecipientId = relevantMessages[relevantMessages.length - 1].receiver_id;
                                
                console.log(otherRecipientId,currentUserEmail);
                messageButton.classList.add('messageButton');
                messageButton.onclick = () => goToChat(otherRecipientId, currentUserEmail);
                messagesPreview.appendChild(messageButton);
            }
        }); 
    })
    .catch(error => {
        console.error("Error fetching messages:", error);
    });
}

function goToChat(otherRecipientId, currentUserId) {
    window.location.href = `chat.html?otherRecipientId=${encodeURIComponent(otherRecipientId)}&currentUserId=${encodeURIComponent(currentUserId)}`;
}