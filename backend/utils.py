# Fonctions utilitaires pour le backend
import datetime

def format_date(date_obj: datetime.date) -> str:
    return date_obj.strftime("%Y-%m-%d")

def format_time(time_obj: datetime.time) -> str:
    return time_obj.strftime("%H:%M")
