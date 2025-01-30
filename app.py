from flask import Flask, jsonify, send_from_directory,render_template,request,redirect,url_for,session,flash
from flask_socketio import SocketIO,emit
from werkzeug.security import generate_password_hash,check_password_hash
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import math
import time
import pyautogui
from flask_pymongo import PyMongo
from datetime import datetime,timedelta
import threading
app = Flask(__name__)
app.config["MONGO_URI"]="mongodb://localhost:27017/hotelbooking"
app.secret_key="Innsight@140"
app.permanent_session_lifetime = timedelta(minutes=10)  # Set session expiration to 30 minutes

mongo=PyMongo(app)
# CORS(app,origins='http://127.0.0.1:5500',methods=['POST'])
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing
socketio=SocketIO(app,cors_allowed_origins=["http://127.0.0.1:5500","http://127.0.0.1:5501"])
session1={}
# Initialize MediaPipe Hands
def check_mongo_connection():
    try:
        # Attempt to get the database
        mongo.db.command("ping")  # A simple command to check the connection
        print("MongoDB connection established.")
        db1=mongo.db.name
        print("database is",db1)
    except Exception as e:
        print("Failed to connect to MongoDB:", e)
        
check_mongo_connection()
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils
#connecting mongoDb server to a live server

# Function to calculate angle between three points
def calculate_distance(x1,y1,x2,y2):
    return math.sqrt((x2-x1)**2+(y2-y1)**2)
def get_distance(landmarks,f,f1):
    thumb_tip=landmarks[4]
    index_tip=landmarks[8]
    x1,y1=thumb_tip[0]*f,thumb_tip[1]*f1
    x2,y2=index_tip[0]*f,index_tip[1]*f1
    distance=calculate_distance(x1,y1,x2,y2)
    return distance
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle

def run_gesture_model():
    cap = cv2.VideoCapture(0)
    last_action_time = time.time()
    action_delay = 2

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)
        frame_height,frame_width,_= frame.shape
        if result.multi_hand_landmarks and result.multi_handedness:
            hand_landmarks_list = result.multi_hand_landmarks
            handedness_list = result.multi_handedness
            
            thumbs_detected = 0
            index_finger_detected = {"Left": False, "Right": False}
            thumb_detected = {"Left": False, "Right": False}
            pinky_detected={"Left":False,"Right":False}
            
            for hand_landmarks, handedness in zip(hand_landmarks_list, handedness_list):
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                landmarks = [[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]
                distance=get_distance(landmarks,frame_width,frame_height)

                index_angle = calculate_angle(landmarks[8], landmarks[7], landmarks[6])
                thumb_angle = calculate_angle(landmarks[4], landmarks[3], landmarks[2])
                pinky_angle=  calculate_angle(landmarks[5],landmarks[9],landmarks[10])
                hand_label = handedness.classification[0].label
                if index_angle > 160:
                    index_finger_detected[hand_label] = True
                
                if thumb_angle > 150:
                    thumbs_detected += 1
                    thumb_detected[hand_label] = True
                if pinky_angle>95:
                    pinky_detected[hand_label]=True
                cv2.putText(frame, f'{hand_label} Index Angle: {int(index_angle)}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(frame, f'{hand_label} Thumb Angle: {int(thumb_angle)}', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(frame, f'{hand_label} pinky Angle: {int(pinky_angle)}', (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(frame, f'{hand_label} distance: {int(distance)}', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
                
            current_time = time.time()
            if distance<30:
                pyautogui.press('esc')
                break
            if pinky_detected["Left"]:
                pyautogui.keyDown('down')
                pyautogui.keyUp('down')
            elif pinky_detected["Right"]:
                pyautogui.keyDown('up')
                pyautogui.keyUp('up')
            elif thumb_detected["Left"]:
                pyautogui.scroll(25)
            elif thumb_detected["Right"]:
                pyautogui.scroll(-25)
                # last_action_time = current_time
            elif index_finger_detected["Right"]:
                pyautogui.keyDown('right')
                pyautogui.keyUp('right')
            elif index_finger_detected["Left"]:
                pyautogui.keyDown('left')
                pyautogui.keyUp('left')

        cv2.imshow('Hand Tracking', frame)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
@app.route('/admin-data', methods=['GET'])
def admin_data():
    try:
        users = list(mongo.db.users_collection.find({}, {'_id': 1, 'username': 1, 'email': 1}))  # Include _id explicitly
        reservations = list(mongo.db.reservation.find({}, {'_id': 1, 'email': 1, 'check_in': 1, 'check_out': 1, 'guests': 1,'total':1}))
        
        # Convert _id fields to strings
        for user in users:
            user['_id'] = str(user['_id'])
        for reservation in reservations:
            reservation['_id'] = str(reservation['_id'])
        
        return jsonify({'users': users, 'reservations': reservations})
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({'message': 'Error fetching admin data'}), 500

@app.route('/')
def reservation_page():
    if 'logged_in' in session:
        return render_template('hotel_info_templae.html')
    else:
        return redirect(url_for('login',next=request.url))
@app.route('/index',methods=['GET'])
def index():
    return render_template('index.html')
@app.route('/adminlogin',methods=['GET','POST'])
def adminlogin():
    print("Entering login route...")
    data = request.get_json()
    email1 = data.get('email')
    password2 = data.get('password')

    if not email1 or not password2:
        return jsonify({'message': 'Please fill all the fields'})
    try:
        user = mongo.db.admindetails.find_one({"username": email1})
        print(user)
        if user:
            pass1=user['password']
            print(pass1==password2)
            if pass1.strip()==password2.strip(): 
                    return jsonify({'redirect': 'admin.html'})
            else:
                    return jsonify({'message': 'Invalid username or password'}),401
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'message': 'An error occurred during login'}),500

def user_exists(username,email):
    return mongo.db.admindetails.find_one({"$or":[{"username":email}]})
def is_valid_password(password):
    return len(password)>=8
@app.route('/login',methods=['GET','POST'])
def login():
    print("Entering login route...")
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Please fill all the fields'})

    try:
        user = mongo.db.users_collection.find_one({'email': email})
        user1 = mongo.db.users_collection.find_one({'username': email})
        # Replace with your user collection

        if user and check_password_hash(user['password'], password) :  # Assuming passwords are hashed
            session1['loginuser'] = email
            print(session1['loginuser'])
            return jsonify({'redirect': 'index.html'})
        else:
            return jsonify({'message': 'Invalid username or password'}),401
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'message': 'An error occurred during login'}),500

def user_exists(username,email):
    return mongo.db.users_collection.find_one({"$or":[{"username":username},{"email":email}]})
def is_valid_password(password):
    return len(password)>=8
@app.route('/signup', methods=['POST'])
def signup():
    print("Entering signup route...")

    # Get JSON data from the request
    data = request.get_json()

    # Validate input
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Please fill all the fields'}), 400

    try:
        # Check if the user already exists
        if user_exists(username, email):
            return jsonify({'message': 'Username or email already exists! Please try another.'}), 400

        # Validate the password
        if not is_valid_password(password):
            return jsonify({'message': 'Password must be at least 8 characters long!'}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)
        
        # Insert new user into the database
        mongo.db.users_collection.insert_one({
            'username': username,
            'email': email,
            'password': hashed_password
        })

        return jsonify({'message': 'Signup successful!'}), 201

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'message': 'An error occurred during signup'}), 500
@app.route('/reserve',methods=['POST'])
def reserve():
    print("it has entered :")
    data=request.get_json()
    check_in=data.get('check_in')
    check_out=data.get('check_out')
    guests=data.get('guests')
    rent=data.get('rent')
    loggedIn=data.get('isloggedIN')
    if not loggedIn:
        return jsonify({'message':'unauthorized access please login to continue'})
    if not check_in or not check_out or not guests:
        return jsonify({'message':'Please fill all the fields'})
    check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
    check_out_date = datetime.strptime(check_out, "%Y-%m-%d")

# Get the current date (without time)
    current_date = datetime.now().date()

# Ensure check-in is not before the current date
    if check_in_date.date() < current_date:
        return jsonify({'message': 'Check-in date cannot be before the current date'})

# Ensure the difference between check-in and check-out is within 10 days
    date_difference = (check_out_date - check_in_date).days

    if date_difference > 30:
        return jsonify({'message': 'Stay cannot be longer than 30 days'})
    k=int(date_difference)*int(rent)
    user = session1['loginuser']
    print(user)
    try:
        reservation={
            'email':user,
            'check_in':check_in,
            'check_out':check_out,
            'guests':int(guests),
            'rent':int(rent),
            'days':int(date_difference),
            'total':int(k)
        }
        mongo.db.reservation.insert_one(reservation)
        return jsonify({'message':f'Reservation successful for {date_difference} days and total is Rs {k}'})
    except ValueError:
        return jsonify({'message':'Invalid reservation'})
@app.route('/logout')
def logout():
    session1.clear()
    session.clear()
    flash('Logged_out!','success')
    return redirect(url_for('login'))
@socketio.on('run_gesture')
def run_gesture():
    # Function to run your gesture model
    run_gesture_model()
    return jsonify({"message": "Gesture model is running"})

if __name__ == '__main__':
    socketio.run(app,debug=True,port=5000)
