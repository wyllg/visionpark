<div align="center">
  <h1>VisionPark: Automated Parking Management System</h1>
  <p><a href="https://visionpark.vercel.app/"><strong>visionpark.vercel.app</strong></a></p>
</div>

---

<div align="center">
  <h2>Media & Demonstration</h2>
  
  <img width="800" alt="VisionPark Demo" src="YOUR_GIF_LINK_HERE" />
  
  <br><br>
  
  <h3>Dashboard Screenshots:</h3>
  <img width="800" alt="Admin Dashboard" src="https://github.com/wyllg/visionpark/blob/e09dc17ba47dbe2f7e325aa8a593437ec85e5515/AdminScreen.png?raw=true" />
  <br><br>
  <img width="800" alt="Worker Approval Screen" src="https://github.com/wyllg/visionpark/blob/e09dc17ba47dbe2f7e325aa8a593437ec85e5515/WorkerScreen.png?raw=true" />
</div>

---

## What is VisionPark?

VisionPark is a smart parking system designed to replace traditional paper parking tickets. Instead of handing out tickets, VisionPark uses a camera at the gate to automatically read a vehicle's license plate when it enters and when it leaves. 

The system tracks exactly how long a car has been parked and automatically calculates the parking fee based on the vehicle type (such as a motorcycle versus a car). It features a live website where anyone can check parking status, and a secure control panel for parking attendants to manage entries and exits.

## Key Features

* **Ticketless Parking:** Cameras automatically capture license plates, eliminating the need for paper tickets and reducing physical waste.
* **Live Public Dashboard:** A real-time monitor that anyone can view to see which cars are parked, how long they have been there, and their current parking fee.
* **Smart Worker Verification:** Because camera AI isn't always perfect, the system holds the camera's guess on a private screen. A human worker quickly double-checks the license plate for typos before officially logging the car into the system.
* **Automated Fee Calculation:** The system instantly calculates the final cost when a car leaves based on its specific vehicle type and total time parked.
* **Shift Management:** Workers can clock in and clock out, ensuring that all parking approvals and payments are securely tracked to the correct attendant.

---

## How to Use VisionPark

The system is designed for three different types of users:

### 1. For Drivers (Public Access)
* **No login is required.**
* Simply open the VisionPark website on your phone or computer.
* You will see the "Live Parking Status" table. This updates instantly and shows all cars currently in the lot, their entry time, and the current running cost of their parking stay.

### 2. For Parking Attendants (Workers)
* **Starting a Shift:** Log in with your worker account and click the button to start your shift. 
* **Approving Entries:** When a car arrives at the gate, the camera will take a picture and guess the license plate. This guess will immediately pop up on your screen. You look at the car, verify the license plate is correct (or fix any typos), confirm the vehicle type, and click "Approve & Publish".
* **Processing Exits:** When a car leaves, the camera captures it again. The system will match it to the parked car and show you the final fee. You collect the payment and click approve to finalize the checkout.

### 3. For Administrators
* Log in with your admin account to access the private Admin Panel.
* From here, you can view the complete history of all cars that have entered and exited the lot.
* You can track worker shifts and download spreadsheet reports of the parking data for record-keeping and financial tracking.

---

## How the System Works (Behind the Scenes)

1. **The Camera:** A small computer (Raspberry Pi) and camera placed at the parking gate watch for cars.
2. **The Smart Guess:** When a car passes, the camera crops the image to find the license plate and tries to read the text locally using AI (YOLO & Tesseract OCR).
3. **The Buffer:** The system sends this text to the worker's dashboard as a "Pending" vehicle. It does not go public yet.
4. **Human Approval:** The worker confirms the text is correct. This prevents the system from saving bad data if the camera misread a dirty or blurry license plate.
5. **Going Live:** Once the worker clicks approve, the car is officially logged into the database and appears on the public live dashboard for everyone to see.

---

## Technologies Used
* **Frontend:** Next.js, Tailwind CSS (Custom Glassmorphism & Traffic Light themes), Clerk (Authentication)
* **Backend:** FastAPI (Python), Supabase (PostgreSQL database with Realtime WebSockets)
* **Edge Hardware & AI:** Raspberry Pi 4, Ultralytics YOLOv8 (Object Detection), PyTesseract (OCR), OpenCV