#!/bin/bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/fastapi
/opt/homebrew/bin/python3.13 -m pip install --break-system-packages -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
