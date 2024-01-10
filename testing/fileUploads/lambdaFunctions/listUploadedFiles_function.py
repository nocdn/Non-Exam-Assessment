import json
import boto3
import urllib.parse

def lambda_handler(event, context):
    # Initialize S3 client
    s3_client = boto3.client('s3')
    bucket_name = 'sharedfileuploads'

    # List objects within the S3 bucket
    response = s3_client.list_objects_v2(Bucket=bucket_name)

    # Extract the file information
    files = [{'Key': obj['Key']} for obj in response.get('Contents', [])]

    # Generate presigned URLs for downloading the files with Content-Disposition header
    for file in files:
        content_disposition = f"attachment; filename=\"{urllib.parse.quote(file['Key'])}\""
        file['DownloadUrl'] = s3_client.generate_presigned_url('get_object',
                                                               Params={'Bucket': bucket_name,
                                                                       'Key': file['Key'],
                                                                       'ResponseContentDisposition': content_disposition},
                                                               ExpiresIn=3600)

    return {
        'statusCode': 200,
        'body': json.dumps(files),
        'headers': {
            'Content-Type': 'application/json',
        }
    }
