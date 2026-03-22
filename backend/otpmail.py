import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import secrets


def sendotp(email):
    def generate_otp():
        return secrets.randbelow(900000)+100000

    otp = generate_otp()
    sender_email = "boomerang3247@gmail.com"
    password ="cxhbujuvhajjnxwh"

    try:
        with smtplib.SMTP("smtp.gmail.com",587) as server:
            server.starttls()
            server.login(sender_email,password)
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = email
            msg["Subject"] = "OTP to login your FoundIt Account"

            msg.attach(MIMEText("Your OTP for the FoundIt Account is","plain"))
            msg.attach(MIMEText(f"<h1>{otp}</h1>","html"))
            server.sendmail(sender_email,email,msg.as_string())
            print("Sent")
            server.quit()

    except Exception as e:
        print(e)
    
    return otp

print(sendotp("boomerang3247@gmail.com"))