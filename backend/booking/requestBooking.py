import boto3
import json
import uuid
from datetime import datetime

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
# Initialize SQS client
sqs = boto3.client('sqs')

table_name = 'GuestRoomBookings'
table = dynamodb.Table(table_name)

sqs_queue_url = 'https://sqs.us-east-1.amazonaws.com/452633565221/BookingRequestQueue'

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
    except (KeyError, json.JSONDecodeError) as e:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid input data format')
        }

    # Extract additional email field
    property_id = body.get('property_id')
    room_id = body.get('room_id')
    check_in_date = body.get('check_in_date')
    check_out_date = body.get('check_out_date')
    email = body.get('email')  # Ensure email is passed in the request

    if not all([property_id, room_id, check_in_date, check_out_date, email]):
        return {
            'statusCode': 400,
            'body': json.dumps('Missing required fields')
        }

    booking_id = str(uuid.uuid4())
    check_in_iso = datetime.strptime(check_in_date, '%Y-%m-%d').isoformat()
    check_out_iso = datetime.strptime(check_out_date, '%Y-%m-%d').isoformat()

    request_item = {
        'booking_id': booking_id,
        'property_id': property_id,
        'room_id': room_id,
        'check_in_date': check_in_iso,
        'check_out_date': check_out_iso,
        'email': email,
        'status': 'reviewing'
    }

    try:
        table.put_item(Item=request_item)
        sqs.send_message(QueueUrl=sqs_queue_url, MessageBody=json.dumps({'booking_id': booking_id, 'approve': True}))
        return {'statusCode': 200, 'body': json.dumps({'message': 'Booking request submitted', 'booking_id': booking_id})}
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps(f'Error: {str(e)}')}
