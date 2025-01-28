import boto3
import json
from datetime import datetime
from zoneinfo import ZoneInfo  # Replaces pytz for timezone handling

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Table names and SNS topic ARN
NOTIFICATION_TABLE = 'NotificationPreferences'
USERS_TABLE = 'Users'
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:219099902329:WaterConsumptionReminders'

# Timezone to match reminder times (change if needed)
TIMEZONE = 'Asia/Jerusalem'  # Change this to match user timezone

def lambda_handler(event, context):
    try:
        # Get current time in the specified timezone
        current_time = get_current_time()

        # Scan the NotificationPreferences table
        notification_table = dynamodb.Table(NOTIFICATION_TABLE)
        response = notification_table.scan()

        for item in response.get('Items', []):
            user_id = item['userId']
            reminders = item.get('reminders', [])

            # Check if any reminder matches the current time
            for reminder in reminders:
                if reminder['time'] == current_time:
                    # Get user's email from Users table
                    email = get_user_email(user_id)
                    if email:
                        send_reminder_email(email, reminder['message'])

        return {
            'statusCode': 200,
            'body': json.dumps('Reminders processed successfully')
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }

def get_current_time():
    """ Get current time in HH:MM format based on the specified timezone """
    now = datetime.now(ZoneInfo(TIMEZONE))
    return now.strftime('%H:%M')

def get_user_email(user_id):
    """ Retrieve user's email from the Users table """
    users_table = dynamodb.Table(USERS_TABLE)
    response = users_table.get_item(Key={'userId': user_id})
    return response.get('Item', {}).get('email')

def send_reminder_email(email, message):
    """ Send reminder email via SNS """
    sns.publish(
        TopicArn=SNS_TOPIC_ARN,
        Message=f'Reminder: {message}',
        Subject='Water Consumption Reminder',
        MessageAttributes={
            'email': {
                'DataType': 'String',
                'StringValue': email
            }
        }
    )
