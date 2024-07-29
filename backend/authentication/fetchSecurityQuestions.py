import json
import boto3
import os

dynamo = boto3.resource('dynamodb')
table_name = os.environ.get('DYANAMODB_TABLE_NAME')
table = dynamo.Table(table_name)

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
        print(json.dumps(event))
        token = event['headers']['authorization'].split(' ')[1]
        print("Token ----> ", token)
        username = get_username_from_token(token)
        
        response = table.get_item(Key={'username': username})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }

        user_details = response['Item']
        security_questions = user_details.get('securityQuestions', [])

        return {
            'statusCode': 200,
            'body': json.dumps({'securityQuestions': security_questions})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
