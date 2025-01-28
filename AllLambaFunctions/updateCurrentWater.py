import boto3
import json
from decimal import Decimal

def lambda_handler(event, context):
    # DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Users')  # Replace 'Users' with your table name

    # Extracting userId and new currentWater from the event
    try:
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "Request body is required"})
            }

        request_body = json.loads(body)
        user_id = request_body.get("userId")
        additional_water = request_body.get("currentWater")

        if not user_id or additional_water is None:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "userId and currentWater are required"})
            }

        # Convert additional_water to Decimal
        additional_water = Decimal(str(additional_water))

    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": f"Invalid input: {str(e)}"})
        }

    # Add the additional water to the existing currentWater in DynamoDB
    try:
        table.update_item(
            Key={'userId': user_id},
            UpdateExpression="set currentWater = if_not_exists(currentWater, :start) + :val",
            ExpressionAttributeValues={
                ':val': additional_water,
                ':start': Decimal('0')  # Ensure initial value is also Decimal
            }
        )
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": f"Successfully added {additional_water} to currentWater for userId {user_id}"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": f"Internal server error: {str(e)}"})
        }
