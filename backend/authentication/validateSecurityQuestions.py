import json
import boto3
import hashlib

dynamo = boto3.resource('dynamodb')
table = dynamo.Table('Users')

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
        print("Event --->",json.dumps(event))
        print("Body ---> ",json.dumps(event['body']))
        token = event['headers'].get('authorization', '').split(' ')[1]
        body = json.loads(event['body'])
        answers = body['answers']
        print("Answers -->", answers)
        
        username = get_username_from_token(token)
        print("Username --> ", username)
        
        response = table.get_item(Key={'username': username})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        print("Response --->", response)
        user_details = response['Item']
        security_questions = user_details.get('securityQuestions', [])
        
        print("Security Questions --> ", security_questions)
        
        for answer in answers:
            question = answer['question']
            user_answer = answer['answer']
            print("Outer For Loop --> Question:", question, "Answer:", user_answer)
            match_found = False
            for item in security_questions:
                if item['question'] == question:
                    print("Match found for question -->: ", item)
                    match_found = True
                    if item['answer'] != user_answer:
                        return {
                            'statusCode': 400,
                            'body': json.dumps({'message': 'Incorrect answer for one or more questions.'})
                        }
            if not match_found:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': f'Question "{question}" not found.'})
                }
        print("Outside FOR LOOP ---")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Security questions answered correctly!'})
        }
    except Exception as e:
        print(f"Exception: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }