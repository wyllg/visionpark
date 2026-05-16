# VisionPark

An intelligent, edge-to-cloud automated parking management system that utilizes computer vision for license plate recognition, coupled with a real-time responsive web dashboard.

## Media / Demo

<!-- ⚠️ REPLACE THE PLACEHOLDERS BELOW WITH YOUR OWN VIDEOS AND IMAGES ⚠️ -->

### System Demo
*[Insert Video Demo Here]*

### Dashboard Screenshots
| Active Parking View | Worker Approval Panel |
| :---: | :---: |
| *[Insert Image Here]* | *[Insert Image Here]* |

---

## Overall Project Description

VisionPark is designed to modernize parking lots by replacing manual ticketing with an automated, image-processing-based pipeline. It captures vehicle license plates upon entry and exit, records timestamps, and automatically computes parking fees based on vehicle type (e.g., motorcycles vs. cars).

The system is built with a **"Human-in-the-Loop"** philosophy. Recognizing that AI Optical Character Recognition (OCR) is not always 100% accurate, VisionPark uses a smart buffering system. When a car arrives, the AI's guess is placed into a "Pending" queue where an on-site worker can quickly verify or correct the read before it is published to the live parking database.

## How It Works

1. **Edge Detection (The Gate):** A camera connected to an edge device (like a Raspberry Pi 4) captures incoming and outgoing vehicles. A local Python script intelligently crops the image to isolate the license plate, minimizing processing overhead.
2. **Local AI Processing:** A lightweight YOLO model (YOLOv8-Nano) runs locally on the edge device to detect the bounding box of the plate, and Tesseract OCR extracts the characters. Keeping the heavy image processing off the cloud ensures the system remains fast and resilient against internet fluctuations.
3. **The "Pending" Buffer:** The raw text data and detection confidence are sent to the cloud database. Instead of directly registering the car, it goes into a pending state to prevent ghost entries or OCR typos.
4. **Worker Validation & Shift Sessions:** Parking attendants (logged in via a Shift Handover protocol to ensure data is tied to the correct operator) see the pending car instantly pop up on their dashboard via WebSockets. They verify the vehicle type, correct any AI typos, and hit "Approve & Publish."
5. **Live Dashboard & Real-time Sync:** Once approved, the car enters the "Active Parking" table. The Next.js dashboard acts as a public-facing monitor where anyone (even unauthenticated drivers) can view parked cars, time elapsed, and current fees in real-time.
6. **Checkout & Exit:** Upon exit, the system fuzzy-matches the exiting plate against active cars, calculates the final fee based on duration and vehicle type, and logs the historical record for administrative analytics. Admins can later download CSV reports of shift and revenue data.

## Technologies Used

### Frontend (Web Dashboard)
* **Next.js (App Router):** The core React framework for building the dynamic user interface.
* **Tailwind CSS:** Used for responsive styling, featuring a custom "Traffic Light" theme and modern glassmorphism UI components.
* **Clerk:** Handles secure user authentication, organization management (Worker vs. Admin roles), and secure session states.

### Backend & Database
* **FastAPI (Python):** A high-performance REST API backend handling business logic, worker shifts, and intelligent checkout routing.
* **Supabase:** The core PostgreSQL database. Utilizes **Supabase Realtime (WebSockets)** to instantly push camera detections to the frontend without heavy API polling, and **Row Level Security (RLS)** to protect backend endpoints based on Clerk user roles.

### Edge Processing (Hardware & AI)
* **Raspberry Pi / Edge Hardware:** The edge computing hardware managing the camera feeds and local logic in outdoor conditions.
* **Ultralytics YOLOv8:** A highly optimized object detection model trained to identify license plates locally.
* **PyTesseract (Tesseract OCR):** Extracts the alphanumeric characters from the cropped license plate images.
* **OpenCV:** For image manipulation and frame processing.