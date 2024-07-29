import json
import boto3
import os

user_pool_id = os.environ.get('COGNITO_USERPOOL_ID')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    username = body['username']


    client = boto3.client('cognito-idp')

    try:
        response = client.admin_confirm_sign_up(
            UserPoolId=user_pool_id,
            Username=username
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User confirmed successfully!'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not confirm user', 'message': str(e)})
        }
