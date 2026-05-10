import cv2
import time
import os
import re
import pytesseract
from ultralytics import YOLO

pytesseract.pytesseract.tesseract_cmd = r'C:\Users\wyell\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'#can be change depending on the tesseract location

model = YOLO("best.pt") 

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

OUTPUT_FOLDER = "license_plates"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

vehicle_memory = {}

CAPTURE_LIMIT = 4
CAPTURE_DELAY = 0.3
CONF_THRESHOLD = 0.40
STABLE_FRAMES_REQUIRED = 2
MAX_TRACK_LIFETIME = 80

INNER_SCALE = 0.95
PAD_X = 0.15
PAD_Y = 0.25

frame_count = 0

print("VisionPark OCR System Active... Press 'Q' to quit.")

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame = cv2.resize(frame, (640, 640))

    results = model.track(
        frame,
        persist=True,
        conf=CONF_THRESHOLD
    )

    frame_count += 1

    for result in results:

        boxes = result.boxes

        if boxes.id is None:
            continue

        track_groups = {}

        for i, (box, track_id, conf) in enumerate(
            zip(boxes.xyxy, boxes.id, boxes.conf)
        ):

            x1, y1, x2, y2 = map(int, box)

            track_id = int(track_id)
            conf = float(conf)

            if conf < CONF_THRESHOLD:
                continue

            cls_id = int(boxes.cls[i]) if boxes.cls is not None else 0
            char = model.names[cls_id]

            cx = x1

            if track_id not in track_groups:
                track_groups[track_id] = []

            track_groups[track_id].append(
                (cx, char, (x1, y1, x2, y2))
            )

        for track_id, items in track_groups.items():

            if len(items) == 0:
                continue

            items = sorted(items, key=lambda x: x[0])

            yolo_text = "".join([i[1] for i in items])

            x1 = min(i[2][0] for i in items)
            y1 = min(i[2][1] for i in items)
            x2 = max(i[2][2] for i in items)
            y2 = max(i[2][3] for i in items)

            width = x2 - x1
            height = y2 - y1

            if width < 60 or height < 20:
                continue

            ratio = width / height

            if ratio < 1.5 or ratio > 7.0:
                continue

            if track_id not in vehicle_memory:

                vehicle_memory[track_id] = {
                    "count": 0,
                    "stable": 0,
                    "last_box": None,
                    "last_seen": frame_count,
                    "last_time": 0.0,
                    "plate_text": "UNKNOWN"
                }

            stats = vehicle_memory[track_id]

            stats["last_seen"] = frame_count

            if stats["last_box"] is not None:

                lx1, ly1, lx2, ly2 = stats["last_box"]

                shift = abs(x1 - lx1) + abs(y1 - ly1)

                if shift < 10:
                    stats["stable"] += 1
                else:
                    stats["stable"] = 0

            stats["last_box"] = (x1, y1, x2, y2)

            if stats["stable"] < STABLE_FRAMES_REQUIRED:
                continue

            cx1 = int(x1 + width * (1 - INNER_SCALE) / 2)
            cy1 = int(y1 + height * (1 - INNER_SCALE) / 2)
            cx2 = int(x2 - width * (1 - INNER_SCALE) / 2)
            cy2 = int(y2 - height * (1 - INNER_SCALE) / 2)

            pad_x = int((cx2 - cx1) * PAD_X)
            pad_y = int((cy2 - cy1) * PAD_Y)

            h, w = frame.shape[:2]

            px1 = max(0, cx1 - pad_x)
            py1 = max(0, cy1 - pad_y)
            px2 = min(w, cx2 + pad_x)
            py2 = min(h, cy2 + pad_y)

            plate_crop = frame[py1:py2, px1:px2]

            if plate_crop.size == 0:
                continue

            gray = cv2.cvtColor(
                plate_crop,
                cv2.COLOR_BGR2GRAY
            )

            gray = cv2.resize(gray, None, fx=3, fy=3)

            gray = cv2.GaussianBlur(gray, (5, 5), 0)

            _, gray = cv2.threshold(
                gray,
                0,
                255,
                cv2.THRESH_BINARY + cv2.THRESH_OTSU
            )

            config = (
                r'--oem 3 --psm 7 '
                r'-c tessedit_char_whitelist='
                r'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            )

            ocr_text = pytesseract.image_to_string(
                gray,
                config=config
            )

            ocr_text = ocr_text.upper()
            ocr_text = re.sub(r'[^A-Z0-9]', '', ocr_text)

            if len(yolo_text) >= 3:
                final_text = yolo_text
            elif len(ocr_text) >= 3:
                final_text = ocr_text
            else:
                final_text = "UNKNOWN"

            stats["plate_text"] = final_text

            current_time = time.time()

            if stats["count"] < CAPTURE_LIMIT:

                if (current_time - stats["last_time"]) >= CAPTURE_DELAY:

                    timestamp = int(current_time * 1000)

                    shot_number = stats["count"] + 1

                    filename = (
                        f"{final_text}_"
                        f"ID{track_id}_"
                        f"SHOT{shot_number}_"
                        f"{timestamp}.jpg"
                    )

                    filepath = os.path.join(
                        OUTPUT_FOLDER,
                        filename
                    )

                    cv2.imwrite(filepath, plate_crop)

                    print(
                        f"[CAPTURED] "
                        f"Plate: {final_text} "
                        f"| Shot {shot_number}/{CAPTURE_LIMIT}"
                    )

                    stats["count"] += 1
                    stats["last_time"] = current_time
                    stats["stable"] = 0

            color = (
                (0, 255, 0)
                if stats["count"] < CAPTURE_LIMIT
                else (255, 0, 0)
            )

            display_text = (
                f"{final_text} | "
                f"ID:{track_id} "
                f"({stats['count']}/{CAPTURE_LIMIT})"
            )

            cv2.rectangle(
                frame,
                (px1, py1),
                (px2, py2),
                color,
                2
            )

            cv2.putText(
                frame,
                display_text,
                (px1, py1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2
            )

    to_delete = []

    for tid, stats in vehicle_memory.items():

        if frame_count - stats["last_seen"] > MAX_TRACK_LIFETIME:
            to_delete.append(tid)

    for tid in to_delete:
        del vehicle_memory[tid]

    cv2.imshow("VisionPark OCR Feed", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()