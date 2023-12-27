import json
key = 'sk-################################################'
def lambda_handler(event, context):
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps({'key': key})
    }
