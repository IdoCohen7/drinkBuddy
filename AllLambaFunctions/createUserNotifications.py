import boto3
import json

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Table names and SNS topic ARN
NOTIFICATION_TABLE = 'NotificationPreferences'
USERS_TABLE = 'Users'
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:219099902329:WaterConsumptionReminders'

def lambda_handler(event, context):
    try:
        # Parse JSON body
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event  # Handle direct API Gateway test events

        user_id = body.get('userId')
        reminders = body.get('reminders', [])

        if not user_id or not reminders:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing userId or reminders in the request')
            }
        
        # Step 1: Upsert (update or insert) user reminders
        update_user_reminders(user_id, reminders)

        # Step 2: Get user email from Users table
        email = get_user_email(user_id)
        
        if not email:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps(f'No email found for userId {user_id}')
            }
        
        # Step 3: Subscribe email to SNS topic
        subscribe_to_sns(email)

        return {
            'statusCode': 200,
            'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps('User reminders updated and subscribed to SNS successfully')
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(f'Error: {str(e)}')
        }

def update_user_reminders(user_id, reminders):
    """ Update or insert user reminders in a single DynamoDB record """
    notification_table = dynamodb.Table(NOTIFICATION_TABLE)

    notification_table.put_item(
        Item={
            'userId': user_id,
            'reminders': reminders
        }
    )

def get_user_email(user_id):
    """ Retrieve user's email from the Users table """
    users_table = dynamodb.Table(USERS_TABLE)
    response = users_table.get_item(Key={'userId': user_id})
    return response.get('Item', {}).get('email')

def subscribe_to_sns(email):
    """ Subscribe the user's email to the SNS topic if not already subscribed """

    # Get list of existing subscriptions for the SNS topic
    response = sns.list_subscriptions_by_topic(TopicArn=SNS_TOPIC_ARN)

    # Check if the email is already subscribed
    for subscription in response.get('Subscriptions', []):
        if subscription.get('Endpoint') == email and subscription.get('Protocol') == 'email':
            print(f'Email {email} is already subscribed to SNS topic.')
            return  # No need to subscribe again

    # If email is not found, subscribe it
    sns.subscribe(
        TopicArn=SNS_TOPIC_ARN,
        Protocol='email',
        Endpoint=email
    )
    print(f'Subscribed {email} to SNS topic.')