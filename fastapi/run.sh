#!/bin/bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi
source .env
pip install -r requirements.txt -q
uvicorn main:app --host $HOST --port $PORT --reload
