import os
from google.cloud import aiplatform

# Set environment variables
os.environ['GOOGLE_CLOUD_PROJECT_ID'] = 'sikupi'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/home/notsuperganang/Documents/utu-awards/sikupi/sikupi-backend/sikupi-459940e4621d.json'

# Test connection
aiplatform.init(project=os.environ['GOOGLE_CLOUD_PROJECT_ID'])
print("✅ Google Cloud connection successful!")