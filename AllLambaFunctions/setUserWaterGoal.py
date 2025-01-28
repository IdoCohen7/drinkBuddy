import boto3
import json
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
users_table_name = 'Users'  # Replace with your DynamoDB table name
users_table = dynamodb.Table(users_table_name)

def lambda_handler(event, context):
    try:
        # Parse the request body
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"message": "Request body is required"})
            }

        request_body = json.loads(body)
        user_id = request_body.get("userId")
        new_water_goal = request_body.get("waterGoal")

        # Validate inputs
        if not user_id or new_water_goal is None:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"message": "userId and waterGoal are required"})
            }

        # Update the waterGoal in the Users table
        users_table.update_item(
            Key={'userId': user_id},
            UpdateExpression="SET waterGoal = :waterGoal",
            ExpressionAttributeValues={":waterGoal": Decimal(new_water_goal)}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "message": "Water goal updated successfully",
                "userId": user_id,
                "newWaterGoal": new_water_goal
            })
        }

    except Exception as e:
        print(f"Error updating water goal: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "message": "Internal server error",
                "error": str(e)
            })
        }
