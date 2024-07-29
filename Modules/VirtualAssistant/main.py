import functions_framework
import json
import requests
from flask import Flask,request

def get_room_details(booking_reference):
    try:
        lambda_url = 'https://nncv57yevchcwp7ao2c4cqzhde0jghjo.lambda-url.us-east-1.on.aws/'
        payload = {'booking_reference': booking_reference}
        booking_details = requests.post(lambda_url, json=payload).json()
        print('booking....',booking_details)
        return booking_details        
    except Exception as e:
        print(e)

def forward_to_agent(property_info):
    response_text = f"Invalid Booking reference."
    headers = {
        "Content-Type": "application/json"
    }
    try:
        gcp_url = 'https://us-central1-serverless-project-427212.cloudfunctions.net/publish_concern'
        response = get_room_details(property_info['booking_reference'])      

        if('property_id' in response):
            print('response...',response)
            payload = {'booking_reference': property_info['booking_reference'],'content':property_info['content'], 'propertyId':response['property_id'],'senderEmailId':property_info['senderEmailId']}
            post = requests.post(gcp_url, headers = headers, json=payload).json()
            response_text = f"Your concern has been recorded. A property agent will contact you shortly."        
    except Exception as e:
        print(e)
        
    return response_text
    
@functions_framework.http
def chatbot_webhook(input_request):
    req = request.json
    print('request........',req)
    intent = req['queryResult']['intent']['displayName']
    context_out = []

    if intent == 'SearchRoomDetails': 
        booking_reference = req['queryResult']['parameters']['BookingReference']
        response = get_room_details(booking_reference)
        print('response.....',response)
        room_details = response

        if('room_id' in room_details):
            response_text = f"booking reference: {booking_reference}\n Room number: {room_details['room_id']}\n  Stay duration in days : {room_details['duration']}"
        else:
            response_text = room_details

        

    elif intent == 'CustomerConcerns':
        concern_description = req['queryResult']['parameters']
        response_text = forward_to_agent(concern_description)

    elif intent == 'RegistrationIntent':
        response_text = req['queryResult']['fulfillmentText']
        context_out = [{"name": "register-followup", "lifespanCount": 5}]
    else:
        response_text = "I'm not sure how to handle that request."

    return {
        "fulfillmentText": response_text,
        "outputContexts": context_out
    }







#req = {'responseId': '784992c1-acfc-425c-bb55-4b751a388679-14a02368', 'queryResult': {'queryText': '1234', 'parameters': {'BookingReference': 'ce35e7b0-03b8-4a93-bd49-ddc5d34632c3'}, 'allRequiredParamsPresent': True, 'fulfillmentMessages': [{'text': {'text': ['']}}], 'outputContexts': [{'name': 'projects/lab-activity2-428216/agent/sessions/dfMessenger-57336883/contexts/__system_counters__', 'parameters': {'no-input': 0.0, 'no-match': 0.0, 'BookingReference': 'ce35e7b0-03b8-4a93-bd49-ddc5d34632c3', 'BookingReference.original': 'ce35e7b0-03b8-4a93-bd49-ddc5d34632c3'}}], 'intent': {'name': 'projects/lab-activity2-428216/agent/intents/9348f39e-b9db-4a28-a9bf-7f2ff586ea5e', 'displayName': 'SearchRoomDetails'}, 'intentDetectionConfidence': 0.3, 'languageCode': 'en'}, 'originalDetectIntentRequest': {'payload': {}}, 'session': 'projects/lab-activity2-428216/agent/sessions/dfMessenger-57336883'}
#req = {'responseId': 'e8a6dfc5-c236-4fb1-906a-d95ed0b5440d-14a02368', 'queryResult': {'queryText': 'n@gmail.com', 'parameters': {'booking_reference': 'ce35e7b0-03b8-4a93-bd49-ddc5d34632c3', 'senderEmailId': 'ashish.nagpal@dal.ca', 'content':'electricty issues to be resolved...'}, 'allRequiredParamsPresent': True, 'fulfillmentMessages': [{'text': {'text': ['']}}], 'outputContexts': [{'name': 'projects/lab-activity2-428216/agent/sessions/dfMessenger-81862989/contexts/__system_counters__', 'parameters': {'no-input': 0.0, 'no-match': 0.0, 'booking_reference': '1232', 'booking_reference.original': '1232', 'senderEmailId': 'n@gmail.com', 'senderEmailId.original': 'ashish.nagpal@dal.ca'}}], 'intent': {'name': 'projects/lab-activity2-428216/agent/intents/10fa6a0e-d6d2-4234-9d3a-aa00497ebeea', 'displayName': 'CustomerConcerns'}, 'intentDetectionConfidence': 1.0, 'languageCode': 'en'}, 'originalDetectIntentRequest': {'payload': {}}, 'session': 'projects/lab-activity2-428216/agent/sessions/dfMessenger-81862989'}
#print(webhook(req))