import json
from pathlib import Path
from app.services.db import SQLiteDatabaseService

def print_separator(title):
    print(f"\n{'='*20} {title} {'='*20}")

def run_playground():
    # 1. Initialize the Database Service
    # We use a local file 'playground.db' for testing
    db_path = "playground.db"
    print_separator("1. Initializing Database")
    print(f"Using database file: {db_path}")
    db = SQLiteDatabaseService(db_path)
    print("Database initialized successfully.")

    # 2. Create a User
    # We need a user to associate interviews with
    print_separator("2. Creating User")
    user_id = "test_user_001"
    password_hash = "hashed_secret_password"
    
    # Check if user exists first to avoid error on re-run
    existing_user = db.get_user(user_id)
    if existing_user:
        print(f"User '{user_id}' already exists.")
    else:
        db.create_user(user_id, password_hash)
        print(f"User '{user_id}' created.")

    # 3. Create a New Interview
    print_separator("3. Creating Interview")
    # This is the initial data for an interview
    interview_payload = {
        "created_at": "2025-12-10T10:00:00Z",
        "mode": "training",
        "setup": {
            "interviewType": "Mock Interview",
            "targetIndustry": "Software Engineering"
        },
        "transcript": [] # Empty transcript to start
    }
    
    interview_id = db.create_interview(user_id, interview_payload)
    print(f"Interview created with ID: {interview_id}")

    # 4. Update the Interview
    # Simulate updating settings or last question
    print_separator("4. Updating Interview")
    update_data = {
        "last_question": "Tell me about yourself.",
        "last_question_audio_url": "/static/audio/question_1.mp3"
    }
    db.update_interview(interview_id, update_data)
    print("Interview updated with last question info.")

    # 5. Append Transcript Entries
    # Simulate a conversation turn
    print_separator("5. Appending Transcript")
    
    # User message
    user_msg = {
        "role": "user",
        "content": "I am a software engineer with 5 years of experience.",
        "timestamp": "2025-12-10T10:01:00Z"
    }
    db.append_transcript_entry(interview_id, user_msg)
    print("Appended user message.")

    # AI Message
    ai_msg = {
        "role": "ai",
        "content": "That's great. What is your strongest technical skill?",
        "timestamp": "2025-12-10T10:01:05Z",
        "audioUrl": "/static/audio/reply_1.mp3"
    }
    db.append_transcript_entry(interview_id, ai_msg)
    print("Appended AI message.")

    # 6. Retrieve Interview Details
    print_separator("6. Retrieving Interview")
    interview_data = db.get_interview(interview_id)
    
    if interview_data:
        print(f"Interview ID: {interview_data['id']}")
        print(f"Mode: {interview_data['mode']}")
        print(f"Transcript count: {len(interview_data['transcript'])}")
        print("Transcript Content:")
        for log in interview_data['transcript']:
            role = log.get('role', 'unknown').upper()
            content = log.get('content', '')
            print(f"  [{role}] {content}")
    else:
        print("Failed to retrieve interview.")

    # 7. List All Interviews for User
    print_separator("7. Listing User Interviews")
    user_interviews = db.list_interviews(user_id)
    print(f"Found {len(user_interviews)} interviews for user '{user_id}':")
    for session in user_interviews:
        print(f" - ID: {session['id']}, Date: {session.get('created_at')}")

if __name__ == "__main__":
    run_playground()
