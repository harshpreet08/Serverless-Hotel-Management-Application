import json
import boto3
import random
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Property')  
    
    body = json.loads(event['body'])

    property_id = body.get('propertyId')
    if not property_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Property ID is required')
        }
    
    try:
        response = table.query(
            KeyConditionExpression=Key('property_id').eq(property_id)
        )
        
        if 'Items' in response:
            property_agents = response['Items']
            print('agents...',random.choice(property_agents))
            selected_agent = random.choice(property_agents)
            return {
                'statusCode': 200,
                'body': json.dumps(selected_agent)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Property agent not found')
            }
    
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving agent from DynamoDB table: {e}")
        }
