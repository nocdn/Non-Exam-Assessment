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

    # Log the extracted parameters
    logger.info(f"File name: {file_name}, Content Type: {content_type}")

    # Check if file_name or content_type is None
    if not file_name or not content_type:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Missing file name or content type'})
        }

    # Generate presigned URL
    presigned_url = s3_client.generate_presigned_url('put_object',
                                                     Params={'Bucket': 'sharedfileuploads',
                                                             'Key': file_name,
                                                             'ContentType': content_type},
                                                     ExpiresIn=3600)

    # Return the presigned URL
    return {
        'statusCode': 200,
        'body': json.dumps({'url': presigned_url})
    }
