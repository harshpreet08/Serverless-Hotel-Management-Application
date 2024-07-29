import boto3
import json

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = 'GuestRoomBookings'
table = dynamodb.Table(table_name)

sns = boto3.client('sns')
sns_topic_arn = "arn:aws:sns:us-east-1:452633565221:DALVacationHomeNotifications"

def lambda_handler(event, context):
    try:
        sqs_record = event['Records'][0]
        body = json.loads(sqs_record['body'])
    except Exception as e:
        error_message = f"Error parsing event body: {str(e)}"
        sns.publish(
            TopicArn=sns_topic_arn,
            Message=error_message,
            Subject='Error notifications'
        )
        return {'statusCode': 400, 'body': json.dumps('Invalid input data format')}
    
    booking_id = body.get('booking_id')
    approve = body.get('approve')

    try:
        response = table.get_item(Key={'booking_id': booking_id})
        request_item = response.get('Item')
        
        if not request_item:
            return {'statusCode': 404, 'body': json.dumps('Booking request not found')}
        
        # Check for any conflicting bookings that are successful
        room_response = table.scan(
            FilterExpression="property_id = :property_id AND room_id = :room_id AND #status = :status",
            ExpressionAttributeValues={
                ":property_id": request_item['property_id'],
                ":room_id": request_item['room_id'],
                ":status": "successful"
            },
            ExpressionAttributeNames={
                "#status": "status"
            }
        )

        # Room is unavailable if there are successful bookings for this room
        room_unavailable = len(room_response['Items']) > 0
        
        if room_unavailable:
            # Update the booking status to 'declined' immediately if room is not available
            table.update_item(
                Key={'booking_id': booking_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'declined'}
            )
            message = "Your booking was unsuccessful. The room is already taken."
            sns.publish(
                TopicArn=sns_topic_arn,
                Message=message,
                Subject='Booking Notification',
                MessageAttributes={
                    'target': {
                        'DataType': 'String.Array',
                        'StringValue': json.dumps([request_item['email']])
                    }
                }
            )
            return {'statusCode': 200, 'body': json.dumps('Booking request declined due to room unavailability.')}

        # Proceed with approval process if the room is available
        if approve and not room_unavailable:
            status = 'successful'
            message = f"Your booking was successful. The room is reserved from {request_item['check_in_date']} to {request_item['check_out_date']}. Enjoy your stay."
            table.update_item(
                Key={'booking_id': booking_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )
        else:
            status = 'denied'
            message = "Your booking request has been denied."
            table.update_item(
                Key={'booking_id': booking_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )

        # Send notification
        sns.publish(
            TopicArn=sns_topic_arn,
            Message=message,
            Subject='Booking Notification',
            MessageAttributes={
                'target': {
                    'DataType': 'String.Array',
                    'StringValue': json.dumps([request_item['email']])
                }
            }
        )
        return {'statusCode': 200, 'body': json.dumps(f'Booking request {status} and notifications sent')}

    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps(f'Error: {str(e)}')}
