import json

def load_input(filepath):
    with open(filepath, 'r') as file:
        return json.load(file)
