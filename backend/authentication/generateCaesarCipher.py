import json
import random
import string
import boto3

dynamo = boto3.resource('dynamodb')
table = dynamo.Table('Users')

def generate_cipher_challenge():
    shift = random.randint(1, 7)
    message = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    cipher_text = ''.join(
        chr(((ord(char) - ord('a') + shift) % 26) + ord('a')) if char.islower()
        else chr(((ord(char) - ord('A') + shift) % 26) + ord('A')) if char.isupper()
        else char
        for char in message
    )
    return cipher_text, message, shift

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
        print("Event ---> ",event)
        token = event['headers'].get('authorization', '').split(' ')[1]
        print("Token--> ",token)
        username = get_username_from_token(token)
        print("Username -->", username)
        cipher_text, original_message, shiftKey = generate_cipher_challenge()
        
        table.update_item(
            Key={'username': username},
            UpdateExpression='SET cipherChallenge = :challenge, cipherAnswer = :answer',
            ExpressionAttributeValues={
                ':challenge': cipher_text,
                ':answer': original_message
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'challenge': cipher_text, 'key': shiftKey})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
