import json
import random
import string
import boto3
import os

dynamo = boto3.resource('dynamodb')
table_name = os.environ.get('DYANAMODB_TABLE_NAME')
table = dynamo.Table(table_name)
sns = boto3.client('sns')

sns_topic_arn = os.environ.get('SNS_TOPIC_ARN')

def get_username_from_token(token):
    lambda_client = boto3.client('lambda')
    print("Get Username --> ")
    response = lambda_client.invoke(
        FunctionName='validateToken',  
        InvocationType='RequestResponse',
        Payload=json.dumps({"body": {"token": token}})
    )
    print("Request successfull")
    print(response)
    response_payload = json.loads(response['Payload'].read().decode('utf-8'))
    print("response_payload", response_payload)
    if response_payload['statusCode'] != 200:
        raise Exception(response_payload['body'])
    
    return json.loads(response_payload['body'])['username']

def lambda_handler(event, context):
    try:
        print("Event -->",json.dumps(event))
        token = event['headers'].get('authorization', '').split(' ')[1]
        body = json.loads(event['body'])
        user_answer = body['answer']
        
        print("User Answer ----> ",user_answer)
        username = get_username_from_token(token)
        print("Username -->", username)
        
        response = table.get_item(Key={'username': username})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }

        user_details = response['Item']
        cipher_answer = user_details.get('cipherAnswer', '')
        user_role = user_details.get('user_role')
        print("user_role", user_role)

        if user_answer == cipher_answer:
            sns.publish(
                TopicArn=sns_topic_arn,
                Message='Login Successful, Welcome to DAL Vacation Home Notifications!',
                MessageAttributes={
                    'target': {
                        'DataType': 'String',
                        'StringValue': username
                    }
                }
            )
            return {
                'statusCode': 200,
                'body': json.dumps({'success': True, 'message': 'Cipher challenge answered correctly!', 'username': username, 'user_role': user_role})
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': 'Incorrect answer for the cipher challenge.'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
