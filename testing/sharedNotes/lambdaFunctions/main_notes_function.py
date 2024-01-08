import boto3
import json
import logging
from botocore.exceptions import ClientError
import uuid
from datetime import datetime


s3_client = boto3.client('s3')
bucket_name = 'sharednotesbucket'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

def lambda_handler(event, context):
    version = event.get('version', '1.0')  # Default to '1.0' if version key is not present
    
    # Determine HTTP method based on payload version
    if version == '2.0':
        # Handle version 2.0 specific logic
        http_method = event['requestContext']['http']['method']
    else:
        # Handle version 1.0 specific logic
        http_method = event.get('httpMethod')
    
    if http_method == 'GET':
        logger.info('Handling GET request')
        return handle_get_request(event)
    elif http_method == 'POST':
        logger.info('Handling POST request')
        return handle_post_request(event, context)  # Corrected to include context
    elif http_method == 'DELETE':
        logger.info('Handling DELETE request')
        return handle_delete_request(event)
    else:
        logger.warning('Received unexpected HTTP method')
        return {
            'statusCode': 405,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'Method Not Allowed', 'method': http_method})
        }



def handle_get_request(event):
    try:
        # List objects in the S3 bucket
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        notes = []

        # Iterate over each object (if any) in the bucket
        for item in response.get('Contents', []):
            # Get the object using its key and read its contents
            note_object = s3_client.get_object(Bucket=bucket_name, Key=item['Key'])
            note_content = note_object['Body'].read().decode('utf-8')
            note_data = json.loads(note_content)
            notes.append(note_data)  # Add the note data to the notes list

        logger.info(f'Retrieved {len(notes)} notes')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},  # Specify headers if needed
            'body': json.dumps({'notes': notes})
        }

    except ClientError as e:
        # Handle specific client errors from boto3
        logger.error('ClientError', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error fetching notes', 'error': str(e)})
        }
    except Exception as e:
        # Handle unexpected errors
        logger.error('Unhandled exception', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An unexpected error occurred', 'error': str(e)})
        }


def handle_post_request(event, context):
    try:
        logger.info("Received POST request")

        # Load and log the event body
        note_body = json.loads(event['body'])
        logger.info(f"Event Body: {note_body}")

        # Extracting data from the event body
        note_text = note_body['note_text']
        creation_date = note_body['creation_date']
        is_pinned = note_body['is_pinned']

        # Generate a unique note_id
        note_id = str(uuid.uuid4())
        
        # Generate creation_time
        creation_time = datetime.now().strftime('%H:%M:%S')

        # Update note_body with generated note_id and creation_time
        note_body['note_id'] = note_id
        note_body['creation_time'] = creation_time

        # Prepare and store the note in S3
        object_key = f'{note_id}.json'
        s3_client.put_object(Bucket=bucket_name, Key=object_key, Body=json.dumps(note_body))
        logger.info(f"Stored note in S3: {object_key}")

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Note created successfully',
                'note_id': note_id
            })
        }

    except Exception as e:
        # Log the error and return an error response
        logger.error("Error posting note", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error posting note',
                'error': str(e)
            })
        }


def handle_delete_request(event):
    try:
        # Extract note_id from the query string parameters
        note_id = event.get('queryStringParameters', {}).get('noteId')


        if not note_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing note_id'})
            }


        # Perform delete operation on S3 object
        s3_client.delete_object(Bucket=bucket_name, Key=f'{note_id}.json')
        logger.info(f"Deleted note from S3: {note_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Note deleted successfully', 'note_id': note_id})
        }
    except ClientError as e:
        logger.error('ClientError', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error deleting note', 'error': str(e)})
        }
    except Exception as e:
        logger.error('Unhandled exception', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An unexpected error occurred', 'error': str(e)})
        }