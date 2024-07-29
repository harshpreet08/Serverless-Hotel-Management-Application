import base64
import functions_framework
import json
from google.cloud import firestore
import requests
from datetime import datetime

def generate_chat_path(user1_id, user2_id):
    sorted_ids = sorted([user1_id, user2_id])
    encoded_ids = [base64.b64encode(uid.encode()).decode() for uid in sorted_ids]
    return '_'.join(encoded_ids)

def get_property_agent(property_id):
    try:
        lambda_url = 'https://6lfzjpf5vs3ueal5w5fttp7awq0wqfpi.lambda-url.us-east-1.on.aws/'
        payload = {'propertyId': property_id}
        property_agent = requests.post(lambda_url, json=payload).json()
        print('Property Agent...............',property_agent)
        return property_agent        
    except Exception as e:
        print(f"Error retrieving agent from DynamoDB table: {e}")
        return None

def persist_msg(message_data):
    try:
        print('reached...', message_data['propertyId'])
        agent_email = get_property_agent(message_data['propertyId'])['agent_id']

        chat_path = generate_chat_path(message_data['senderEmailId'], agent_email)
        database = firestore.Client(database='(default)')

        chat_messages_ref = database.collection('chat-messages').document(chat_path)
        persist_msg = {
            'booking_reference': message_data['booking_reference'],
            'content': message_data['content'],
            'property_id': message_data['propertyId'],
            'receiver_id': agent_email,
            'sender_id' : message_data['senderEmailId'],
            'timestamp': datetime.now()
        }

        doc_snapshot = chat_messages_ref.get()
        if doc_snapshot.exists:
            messages = doc_snapshot.get('messages') or []
            messages.append(persist_msg)
            chat_messages_ref.update({'messages': messages})
        else:
            chat_messages_ref.set({'messages': [persist_msg]})

    except Exception as e:
        print(f"Error logging to Firestore: {e}")

@functions_framework.cloud_event
def forward_to_agent(cloud_event):
    pub_sub_msg = base64.b64decode(cloud_event.data["message"]["data"])
    message_data = json.loads(pub_sub_msg)
    persist_msg(message_data)
