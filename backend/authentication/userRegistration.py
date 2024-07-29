import json
import boto3
import os

sns = boto3.client('sns')
dynamo = boto3.resource('dynamodb')
table_name = os.environ.get('DYANAMODB_TABLE_NAME')
table = dynamo.Table(table_name)

sns_topic_arn = os.environ.get('SNS_TOPIC_ARN')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    username = body['username']
    address = body['address']
    phone = body['phone']
    security_questions = body['securityQuestions']
    user_role = body['user_role'] # Adding User Role
    
    try:
        table.put_item(
            Item={
                'username': username,
                'address': address,
                'phone': phone,
                'securityQuestions': security_questions,
                'user_role': user_role
            }
        )
        print("Username is ---> ", username)
        response = sns.subscribe(
            TopicArn=sns_topic_arn,
            Protocol='email', 
            Endpoint=username,  # The user's email or phone number
            Attributes={
                'FilterPolicy': json.dumps({
                    'target': [username]
                })
            }
        )
        print("Subscription Success --> Publishing Message")
        sns.publish(
            TopicArn=sns_topic_arn,
            Message='Registration Successful, Welcome to DAL Vacation Home Notifications!',
            MessageAttributes={
                'target': {
                    'DataType': 'String',
                    'StringValue': username
                }
            }
        )
        print("Message Published")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User details stored successfully!'})
        }
    except Exception as e:
        print(str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not store user details', 'message': str(e)})
        }
