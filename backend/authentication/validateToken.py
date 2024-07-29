import json
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import InvalidTokenError
import os

cognito_region = os.environ.get('AWS_REGION')
userpool_id =  os.environ.get('COGNITO_USERPOOL_ID')
app_client_id = os.environ.get('COGNITO_APP_CLIENT_ID')

def get_public_key(kid, keys):
    for key in keys:
        if key['kid'] == kid:
            return RSAAlgorithm.from_jwk(json.dumps(key))
    raise Exception('Public key not found.')

def lambda_handler(event, context):
    try:
        print(json.dumps(event))
        token = event['body'].get('token')
        print("Token --> ", token)
        
        header = jwt.get_unverified_header(token)
        kid = header['kid']
        
        keys_url = f'https://cognito-idp.{cognito_region}.amazonaws.com/{userpool_id}/.well-known/jwks.json'
        response = requests.get(keys_url)
        response.raise_for_status()
        keys = response.json()['keys']
        
        public_key = get_public_key(kid, keys)
        
        decoded_token = jwt.decode(
            token, 
            public_key, 
            algorithms=['RS256'], 
            audience=app_client_id,
            options={"verify_aud": False}
        )
        
        print("Decoded Token", decoded_token)
        username = decoded_token['username']

        return {
            'statusCode': 200,
            'body': json.dumps({'username': username})
        }
    except InvalidTokenError as e:
        return {
            'statusCode': 401,
            'body': json.dumps({'error': f'Invalid token: {e}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
