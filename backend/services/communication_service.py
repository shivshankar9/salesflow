import os
from twilio.rest import Client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from fastapi import HTTPException

# Twilio setup
twilio_account_sid = os.environ.get('TWILIO_ACCOUNT_SID', 'demo')
twilio_auth_token = os.environ.get('TWILIO_AUTH_TOKEN', 'demo')
twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER', '+1234567890')
twilio_whatsapp = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

twilio_client = None
if twilio_account_sid != 'demo':
    twilio_client = Client(twilio_account_sid, twilio_auth_token)

# SendGrid setup
sendgrid_api_key = os.environ.get('SENDGRID_API_KEY', 'demo')
sendgrid_from = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@crm.com')

sendgrid_client = None
if sendgrid_api_key != 'demo':
    sendgrid_client = SendGridAPIClient(sendgrid_api_key)

def send_sms(to_number: str, message: str):
    if not twilio_client:
        return {'status': 'test_mode', 'message': 'SMS would be sent', 'to': to_number}
    try:
        msg = twilio_client.messages.create(
            from_=twilio_phone,
            to=to_number,
            body=message
        )
        return {'status': 'sent', 'message_sid': msg.sid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def send_whatsapp(to_number: str, message: str):
    if not twilio_client:
        return {'status': 'test_mode', 'message': 'WhatsApp would be sent', 'to': to_number}
    try:
        msg = twilio_client.messages.create(
            from_=twilio_whatsapp,
            to=f'whatsapp:{to_number}',
            body=message
        )
        return {'status': 'sent', 'message_sid': msg.sid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def send_email(to_email: str, subject: str, html_content: str):
    if not sendgrid_client:
        return {'status': 'test_mode', 'message': 'Email would be sent', 'to': to_email}
    try:
        message = Mail(
            from_email=sendgrid_from,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        response = sendgrid_client.send(message)
        return {'status': 'sent', 'status_code': response.status_code}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))