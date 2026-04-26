import requests
import time
import random

API_URL = "http://localhost:8000/api/parking/entry"

SAMPLE_PLATES = [
  "XYZ-9876",
  "ADS-4564",
  "ERT-9876",
  "HHH-9446",
  "LMN-4567",
  "GHJ-5555"
]

def simulate_camera_detection():
  detected_plate = random.choice(SAMPLE_PLATES)
  print(f"Car detected with license plate of {detected_plate}")

  payload = {"plate_number": detected_plate}

  try:
    print(f"Sending to FastAPI")
    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
      print("✔️ Successfully sent.")
    else:
      print(f"❌ FAILED: Server returned {response.status_code} - {response.text}")

  except requests.exceptions.ConnectionError:
        print("🚨 ERROR: Could not connect. Is your FastAPI server running on port 8000?")

if __name__ == "__main__":
    print("--- Starting VisionPark Edge Simulator ---")
    print("Press Ctrl+C to stop.")
    
    try:
        while True:
            simulate_camera_detection()
            
            # Wait before the "next car" arrives
            time.sleep(10) 
            
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")
