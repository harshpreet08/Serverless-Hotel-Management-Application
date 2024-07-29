import functions_framework
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import pubsub_v1
import json
import os

app = Flask(__name__)
CORS(app) 

publisher = pubsub_v1.PublisherClient()


@functions_framework.http
def publish_concern(request):
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
        
    request_data = request.get_json()
    if request_data:
        message_data = {
            'propertyId': request_data.get('propertyId', ''),
            'senderEmailId': request_data.get('senderEmailId', ''),
            'content': request_data.get('content', ''),
            'booking_reference': request_data.get('booking_reference', '')
        }
        
        topic_path = 'projects/serverless-project-427212/topics/customer-concerns-topic'
        print('topic.......',topic_path)
        future = publisher.publish(topic_path, data=json.dumps(message_data).encode())

        return jsonify({'status': 'success', 'message': 'Message published to Pub/Sub'}), 200
    else:
        return jsonify({'error': 'Invalid request'}), 400
