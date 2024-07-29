import json
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('GuestRoomBookings') 
    
    booking_reference = json.loads(event['body']).get('booking_reference')
    
    if not booking_reference:
        return {
            'statusCode': 400,
            'body': json.dumps('Booking reference is required')
        }
    
    try:
        response = table.query(
            KeyConditionExpression=Key('booking_id').eq(booking_reference)
        )
        
        
        if 'Items' in response and response['Items']:
            booking_details = response['Items'][0]
            print('booking reference...',booking_details)
            room_id = booking_details.get('room_id')
            check_in_date = booking_details.get('check_in_date')
            check_out_date = booking_details.get('check_out_date')
            check_in = datetime.strptime(check_in_date, '%Y-%m-%dT%H:%M:%S')
            check_out = datetime.strptime(check_out_date, '%Y-%m-%dT%H:%M:%S')
            duration = (check_out - check_in).days
            

            result = {
                    'room_id': room_id,
                    'duration': duration,
                    'property_id': booking_details.get('property_id')
                }

            return {
                'statusCode': 200,
                'body': json.dumps(result)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Booking details not found')
            }
    
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving booking details from DynamoDB table: {e}")
        }
