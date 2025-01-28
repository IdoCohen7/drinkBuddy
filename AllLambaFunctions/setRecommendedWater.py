import boto3
import json
from decimal import Decimal, ROUND_HALF_UP

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
        new_recommended_water = request_body.get("recommendedWater")

        # Validate inputs
        if not user_id or new_recommended_water is None:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"message": "userId and recommendedWater are required"})
            }

        # Convert recommendedWater safely to Decimal with rounding
        new_recommended_water = Decimal(str(new_recommended_water)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Update the recommendedWater in the Users table
        users_table.update_item(
            Key={'userId': user_id},
            UpdateExpression="SET recommendedWater = :recommendedWater",
            ExpressionAttributeValues={":recommendedWater": new_recommended_water}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "message": "Recommended water updated successfully",
                "userId": user_id,
                "newRecommendedWater": float(new_recommended_water)  # Return as float for readability
            })
        }

    except Exception as e:
        print(f"Error updating recommended water: {str(e)}")
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
