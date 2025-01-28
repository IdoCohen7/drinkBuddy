import boto3
from decimal import Decimal
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
users_table_name = 'Users'  # Replace with your DynamoDB table name
weekly_table_name = 'WeeklyConsumption'  # Replace with your new table name
users_table = dynamodb.Table(users_table_name)
weekly_table = dynamodb.Table(weekly_table_name)

def lambda_handler(event, context):
    try:
        # Scan all users in the table
        response = users_table.scan()
        users = response.get('Items', [])

        for user in users:
            user_id = user.get('userId')
            current_water = user.get('currentWater', 0)
            water_goal = user.get('waterGoal', 0)
            streak = user.get('streak', 0)

            # Pass the original current_water to the weekly consumption table
            original_current_water = current_water

            # Determine if the streak should be updated or reset
            if current_water >= water_goal and water_goal != 0:
                streak += 1
                current_water = 0  # Reset currentWater
            else:
                streak = 0  # Reset streak
                current_water = 0  # Reset currentWater

            # Update the user record in Users table
            users_table.update_item(
                Key={'userId': user_id},
                UpdateExpression="SET streak = :streak, currentWater = :currentWater",
                ExpressionAttributeValues={
                    ':streak': Decimal(streak),
                    ':currentWater': Decimal(current_water)
                }
            )

            # Update the WeeklyConsumption table with original current_water
            update_weekly_consumption(user_id, original_current_water)

        return {
            'statusCode': 200,
            'body': f"Processed {len(users)} users successfully."
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"An error occurred: {str(e)}"
        }

def update_weekly_consumption(user_id, daily_consumption):
    today = datetime.utcnow().strftime('%Y-%m-%d')  # Get today's date

    try:
        # Get the existing record for the user in WeeklyConsumption
        response = weekly_table.get_item(Key={'userId': user_id})
        user_data = response.get('Item', {'userId': user_id, 'consumption': []})

        # Extract the existing consumption data
        consumption_history = user_data.get('consumption', [])

        # Prevent duplicate entry for today
        if not any(entry['date'] == today for entry in consumption_history):
            consumption_history.append({'date': today, 'amount': Decimal(str(daily_consumption))})

        # Ensure only the last 7 days are kept
        if len(consumption_history) > 7:
            consumption_history.pop(0)  # Remove the oldest entry

        # Update the WeeklyConsumption table
        weekly_table.put_item(
            Item={
                'userId': user_id,
                'consumption': consumption_history
            }
        )
        print(f"Weekly consumption updated for user {user_id}.")
    except Exception as e:
        print(f"Error updating WeeklyConsumption for user {user_id}: {str(e)}")
