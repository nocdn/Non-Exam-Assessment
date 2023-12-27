import boto3
import json
import logging
from botocore.exceptions import ClientError
import uuid
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')
bucket_name = 'shared-calendar-bucket'


def get_month_range(start_date, end_date):
    start_month = datetime.strptime(start_date, "%d/%m/%Y").month
    start_year = datetime.strptime(start_date, "%d/%m/%Y").year
    end_month = datetime.strptime(end_date, "%d/%m/%Y").month
    end_year = datetime.strptime(end_date, "%d/%m/%Y").year
    
    months = []
    while (start_year, start_month) <= (end_year, end_month):
        months.append(f"{start_year}/{start_month:02d}")
        if start_month == 12:
            start_month = 1
            start_year += 1
        else:
            start_month += 1
    return months


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
        return handle_post_request(event)
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
        # Extract year and month from the query parameters
        year = event['queryStringParameters']['year']
        month = event['queryStringParameters']['month']
        prefix = f'{year}/{month}/'
        logger.info(f'Searching for events in {prefix}')

        # List objects in the S3 bucket for the given year and month
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        events = []

        for item in response.get('Contents', []):
            event_object = s3_client.get_object(Bucket=bucket_name, Key=item['Key'])
            event_content = event_object['Body'].read().decode('utf-8')
            event_data = json.loads(event_content)
            events.append(event_data)

        logger.info(f'Retrieved {len(events)} events')
        return {
            'statusCode': 200,
            'body': json.dumps({'events': events})
        }

    except ClientError as e:
        logger.error('ClientError', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error fetching events', 'error': str(e)})
        }
    except Exception as e:
        logger.error('Unhandled exception', exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An unexpected error occurred', 'error': str(e)})
        }


def handle_post_request(event):
    try:
        logger.info("Received POST request")
        
        # Load and log the event body
        event_body = json.loads(event['body'])
        logger.info(f"Event Body: {event_body}")

        start_date = event_body['start_date']
        end_date = event_body['end_date']
        logger.info(f"Start Date: {start_date}, End Date: {end_date}")

        # Generate eventID and update event body
        event_id = str(uuid.uuid4())
        event_body['eventID'] = event_id
        logger.info(f"Generated eventID: {event_id}")

        # Determine months the event spans and log them
        months = get_month_range(start_date, end_date)
        logger.info(f"Event spans months: {months}")

        # Store event in each month's folder in S3 and log the operation
        for month in months:
            object_key = f'{month}/{event_id}.json'
            s3_client.put_object(Bucket=bucket_name, Key=object_key, Body=json.dumps(event_body))
            logger.info(f"Stored event in S3: {object_key}")

        # Store in DynamoDB and log the operation
        table = dynamodb.Table('eventsIndex')
        table.put_item(Item={
            'eventID': event_id,
            'months': months, # List of months like ['2023/10', '2023/11']
            'start_date': start_date,
            'end_date': end_date,
            # Include other event details as needed
        })
        logger.info(f"Stored event in DynamoDB with eventID: {event_id}")

        # Return success response
        return {'statusCode': 200, 'body': json.dumps({'message': 'Event created successfully', 'eventID': event_id})}
    except Exception as e:
        # Log the error and return an error response
        logger.error("Error posting event", exc_info=True)
        return {'statusCode': 500, 'body': json.dumps({'message': 'Error posting event', 'error': str(e)})}




        
        
def handle_delete_request(event):
    try:
        event_id = event['queryStringParameters']['eventID']
        
        table = dynamodb.Table('eventsIndex')
        response = table.get_item(Key={'eventID': event_id})
        item = response.get('Item')
        
        if not item:
            return {'statusCode': 404, 'body': json.dumps({'message': 'Event not found'})}
        
        # Delete the object from S3 for each month it spans
        for month in item['months']:
            object_key = f'{month}/{event_id}.json'
            s3_client.delete_object(Bucket=bucket_name, Key=object_key)
        
        # Delete the item from DynamoDB
        table.delete_item(Key={'eventID': event_id})
        
        return {'statusCode': 200, 'body': json.dumps({'message': 'Event deleted successfully'})}
    except Exception as e:
        logger.error("Error deleting event", exc_info=True)
        return {'statusCode': 500, 'body': json.dumps({'message': 'Error deleting event', 'error': str(e)})}


