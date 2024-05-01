import json
import boto3
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    # Log the received event
    logger.info("Received event: " + json.dumps(event))

    version = event.get('version', '1.0')  # Default to '1.0' if version key is not present

    # Initialize S3 client
    s3_client = boto3.client('s3')

    # Extract parameters based on payload version
    if version == '2.0':
        # Handle version 2.0 specific logic
        query_params = event.get('queryStringParameters', {})
    else:
        # Handle version 1.0 specific logic
        query_params = event.get('queryStringParameters', {})

    file_name = query_params.get('file_name')
    content_type = query_params.get('content_type')
    group_id = query_params.get('group_id')

    # Log the extracted parameters
    logger.info(f"File name: {file_name}, Content Type: {content_type}, Group ID: {group_id}")

    # Check if file_name, content_type, or group_id is None
    if not file_name or not content_type or not group_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Missing file name, content type, or group ID'})
        }

    # Generate S3 key with group_id as the root "folder"
    s3_key = f"{group_id}/{file_name}"

    # Generate presigned URL
    presigned_url = s3_client.generate_presigned_url('put_object',
                                                     Params={'Bucket': 'sharedfileuploads',
                                                             'Key': s3_key,
                                                             'ContentType': content_type},
                                                     ExpiresIn=3600)

    # Return the presigned URL
    return {
        'statusCode': 200,
        'body': json.dumps({'url': presigned_url})
    }