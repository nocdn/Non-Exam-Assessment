import json
import boto3
import urllib.parse

def lambda_handler(event, context):
    # Initialize S3 client
    version = event.get('version', '1.0')
    s3_client = boto3.client('s3')
    bucket_name = 'sharedfileuploads'
    # Extract parameters based on payload version
    if version == '2.0':
        # Handle version 2.0 specific logic
        query_params = event.get('queryStringParameters', {})
    else:
        # Handle version 1.0 specific logic
        query_params = event.get('queryStringParameters', {})

    group_id = query_params.get('group_id')
    # Set the prefix to the group_id "folder"
    prefix = f"{group_id}/"

    # List objects within the S3 bucket with the prefix
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

    # Extract the file information and metadata
    files = []
    for obj in response.get('Contents', []):
        file_key = obj['Key'].split('/')[-1]
        # Retrieve the metadata for the file
        metadata = s3_client.head_object(Bucket=bucket_name, Key=obj['Key'])['Metadata']
        user_id = metadata.get('user_id', 'Unknown')  # Get the user_id metadata, or set to 'Unknown' if not present

        # Generate presigned URL for downloading the file with Content-Disposition header
        content_disposition = f"attachment; filename=\"{urllib.parse.quote(file_key)}\""
        download_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': bucket_name,
                                                                'Key': obj['Key'],
                                                                'ResponseContentDisposition': content_disposition},
                                                        ExpiresIn=3600)

        files.append({'Key': file_key, 'DownloadUrl': download_url, 'user_id': user_id})

    return {
        'statusCode': 200,
        'body': json.dumps(files),
        'headers': {
            'Content-Type': 'application/json',
        }
    }