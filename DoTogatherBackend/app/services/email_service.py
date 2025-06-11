import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(api_key=settings.sendgrid_api_key)
        self.from_email = settings.from_email

    async def send_verification_email(self, to_email: str, verification_token: str):
        """Send email verification email"""
        try:
            verification_url = f"https://your-app-domain.com/verify-email?token={verification_token}"
            
            subject = "Verify Your DoTogather Account"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to DoTogather!</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Verify Your Email Address</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for signing up for DoTogather! To complete your registration and start managing your tasks, 
                        please verify your email address by clicking the button below.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, you can copy and paste this link into your browser:
                        <br>
                        <a href="{verification_url}" style="color: #667eea;">{verification_url}</a>
                    </p>
                    
                    <p style="color: #666; font-size: 14px;">
                        This verification link will expire in 24 hours. If you didn't create an account with DoTogather, 
                        you can safely ignore this email.
                    </p>
                </div>
                
                <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 0;">© 2024 DoTogather. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Happy task managing! 🚀</p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=Email(self.from_email),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            response = self.sg.send(message)
            logger.info(f"Verification email sent to {to_email}. Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {str(e)}")
            raise e

    async def send_password_reset_email(self, to_email: str, reset_token: str):
        """Send password reset email"""
        try:
            reset_url = f"https://your-app-domain.com/reset-password?token={reset_token}"
            
            subject = "Reset Your DoTogather Password"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p style="color: #666; line-height: 1.6;">
                        We received a request to reset your password for your DoTogather account. 
                        Click the button below to create a new password.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, you can copy and paste this link into your browser:
                        <br>
                        <a href="{reset_url}" style="color: #667eea;">{reset_url}</a>
                    </p>
                    
                    <p style="color: #666; font-size: 14px;">
                        This reset link will expire in 1 hour. If you didn't request a password reset, 
                        you can safely ignore this email.
                    </p>
                </div>
                
                <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 0;">© 2024 DoTogather. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Stay secure! 🔒</p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=Email(self.from_email),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            response = self.sg.send(message)
            logger.info(f"Password reset email sent to {to_email}. Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
            raise e

    async def send_task_reminder_email(self, to_email: str, task_name: str, due_date: str):
        """Send task reminder email"""
        try:
            subject = f"Reminder: {task_name} is due soon!"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Task Reminder 📋</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Don't forget your task!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        This is a friendly reminder that your task "<strong>{task_name}</strong>" is due on {due_date}.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://your-app-domain.com/tasks" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            View Task
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        Keep up the great work! Every completed task brings you closer to your goals. 🎯
                    </p>
                </div>
                
                <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 0;">© 2024 DoTogather. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">You've got this! 💪</p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=Email(self.from_email),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            response = self.sg.send(message)
            logger.info(f"Task reminder email sent to {to_email}. Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send task reminder email to {to_email}: {str(e)}")
            raise e