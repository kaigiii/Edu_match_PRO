import urllib.request
import urllib.error
import time

services = [
    {"name": "Backend API", "url": "http://localhost:3001/docs"},
    {"name": "AI Core API", "url": "http://localhost:8000/docs"},
    {"name": "Frontend", "url": "http://localhost:5173"}
]

print("Verifying services...")
time.sleep(5) # Wait for services to fully start

for service in services:
    try:
        response = urllib.request.urlopen(service["url"], timeout=5)
        print(f"✅ {service['name']} is UP ({service['url']}) - Status: {response.getcode()}")
    except urllib.error.URLError as e:
        print(f"❌ {service['name']} is DOWN ({service['url']}) - Error: {e}")
    except Exception as e:
        print(f"❌ {service['name']} is DOWN ({service['url']}) - Error: {e}")
