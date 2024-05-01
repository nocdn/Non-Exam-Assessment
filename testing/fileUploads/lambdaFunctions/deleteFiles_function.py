import json
import boto3

def lambda_handler(event, context):
    # Initialize S3 client
    s3_client = boto3.client('s3')
    bucket_name = 'sharedfileuploads'
    
    # Parse the filename and group_id from event
    file_name = event['queryStringParameters']['file_name']
    group_id = event['queryStringParameters']['group_id']
    
    print(f"Received file name of: {file_name}")
    
    # Construct the full file path in the bucket
    full_file_path = f"{group_id}/{file_name}"
    print(f"Deleting file from {full_file_path}")
    
    # Delete the object from the bucket at the specified path
    s3_client.delete_object(Bucket=bucket_name, Key=full_file_path)

    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'{full_file_path} deleted successfully'})
    }