

import json
import os

def load_data(filename):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            data = json.load(f)
            print(f"Loaded data: {data}")  # Debugging: Print the loaded data
            return data
    return {}


def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def add_teacher():
    data = load_data("input/teachers.json")  # Load data
    teachers = data["teachers"]  # Access the "teachers" list inside the dictionary
    id = input("Enter teacher ID: ")
    name = input("Enter teacher name: ")
    teachers.append({"id": id, "name": name})  # Append the new teacher to the list
    save_data("input/teachers.json", data)  # Save the updated data
    print("✅ Teacher added.\n")


def add_subject():
    subjects_data = load_data("input/subjects.json")
    subjects = subjects_data.get("subjects", [])  # Safely get the subjects list
    teachers_data = load_data("input/teachers.json")
    teachers = teachers_data.get("teachers", [])  # Safely get teachers list

    print("Loaded Teachers Data:", teachers)  # Debugging: Check the data

    if not teachers:
        print("❌ No teachers available. Please add teachers first.")
        return

    print("\nAvailable Teachers:")
    for t in teachers:
        print(f"- {t['id']}: {t['name']}")

    code = input("Enter subject code: ")
    name = input("Enter subject name: ")
    credits = int(input("Enter credits: "))
    teacher_id = input("Enter teacher ID: ")
    is_lab = input("Is it a lab? (y/n): ").lower() == "y"

    subjects.append({
        "code": code,
        "name": name,
        "credits": credits,
        "teacher_id": teacher_id,
        "is_lab": is_lab
    })

    # Save the updated subjects data
    subjects_data["subjects"] = subjects
    save_data("input/subjects.json", subjects_data)
    print("✅ Subject added.\n")

def add_batch():
    batches = load_data("input/batches.json")
    subjects = load_data("input/subjects.json")

    year = int(input("Enter batch year (e.g., 3): "))
    section = input("Enter section name (e.g., A): ")

    print("\nAvailable subjects:")
    for subj in subjects:
        print(f"- {subj['code']}: {subj['name']}")

    subject_codes = input("Enter subject codes for this section (comma separated): ").split(",")
    subject_codes = [s.strip() for s in subject_codes]

    batches.append({
        "year": year,
        "sections": [{"name": section, "subjects": subject_codes}]
    })
    save_data("input/batches.json", batches)
    print("✅ Batch added.\n")

def export_combined_json():
    teachers = load_data("input/teachers.json").get("teachers", [])
    subjects = load_data("input/subjects.json").get("subjects", [])
    batches = load_data("input/batches.json").get("batches", [])

    full_data = {
        "teachers": teachers,
        "subjects": subjects,
        "batches": batches
    }

    save_data("input/timetable_input.json", full_data)
    print("📦 Combined input saved to timetable_input.json\n")

def main_menu():
    while True:
        print("\n📋 MAIN MENU")
        print("1. Add Teacher")
        print("2. Add Subject")
        print("3. Add Batch & Section")
        print("4. Export Final Input File")
        print("5. Exit")

        choice = input("Choose an option: ")

        if choice == "1":
            add_teacher()
        elif choice == "2":
            add_subject()
        elif choice == "3":
            add_batch()
        elif choice == "4":
            export_combined_json()
        elif choice == "5":
            break
        else:
            print("❌ Invalid choice.")

if __name__ == "__main__":
    main_menu()
