import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize a DynamoDB client
    dynamodb = boto3.client('dynamodb')

    # Table name
    table_name = 'Property'

    try:
        # Scan operation to retrieve all items from the table
        response = dynamodb.scan(
            TableName=table_name
        )
        
        # Clean up the data to be more frontend-friendly
        cleaned_data = [clean_item(item) for item in response['Items']]
        
        # Return the cleaned items
        return {
            'statusCode': 200,
            'body': cleaned_data,
            'message': 'Data retrieved and cleaned successfully!'
        }
    except ClientError as e:
        # Error handling
        return {
            'statusCode': 500,
            'body': [],
            'message': f'An error occurred: {str(e)}'
        }

def clean_item(item):
    """ Convert DynamoDB's format to a simpler dictionary format. """
    cleaned = {}
    for key, value in item.items():
        if 'S' in value:
            cleaned[key] = value['S']
        elif 'N' in value:
            cleaned[key] = int(value['N'])
        elif 'L' in value:
            cleaned[key] = [clean_item(subitem['M']) for subitem in value['L']]
    return cleaned
