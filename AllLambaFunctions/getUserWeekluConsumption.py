import boto3
import json
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
weekly_table_name = 'WeeklyConsumption'  # Replace with your DynamoDB table name
weekly_table = dynamodb.Table(weekly_table_name)


def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


def lambda_handler(event, context):
    try:
        # Parse userId from the request body
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "Request body is required"})
            }

        request_body = json.loads(body)
        user_id = request_body.get("userId")

        if not user_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "userId is required"})
            }

        # Fetch the item from DynamoDB
        response = weekly_table.get_item(Key={'userId': user_id})
        item = response.get('Item')

        if not item:
            return {
                "statusCode": 404,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "User not found"})
            }

        # Extract and convert the consumption array
        consumption = convert_decimal(item.get('consumption', []))

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({
                "message": "User consumption data retrieved successfully",
                "userId": user_id,
                "consumption": consumption
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({
                "message": "An error occurred",
                "error": str(e)
            })
        }
