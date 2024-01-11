import json
import boto3

def lambda_handler(event, context):
    # Initialize S3 client
    s3_client = boto3.client('s3')
    bucket_name = 'sharedfileuploads'
    
    # Parse the filename from event
    file_name = event['queryStringParameters']['file_name']
    
    # Delete the object from the bucket
    s3_client.delete_object(Bucket=bucket_name, Key=file_name)

    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'{file_name} deleted successfully'})
    }
