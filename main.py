from timetable_generator import Timetable
import json
import sys

def load_combined_input():
    """Load and combine input data from multiple JSON files with validation."""
    try:
        # Load teachers data
        with open("input/teachers.json", 'r') as f:
            teachers_data = json.load(f)
        teachers = teachers_data.get("teachers", [])
        
        # Load subjects data
        with open("input/subjects.json", 'r') as f:
            subjects_data = json.load(f)
        
        subjects = []
        # Get subjects from data array if exists
        if "data" in subjects_data and subjects_data["data"]:
            subjects.extend(subjects_data["data"][0].get("subjects", []))
        # Add root-level subjects if exist
        if "subjects" in subjects_data:
            subjects.extend(subjects_data["subjects"])
        
        # Load batches data
        batches = []
        try:
            with open("input/batches.json", 'r') as f:
                batches_data = json.load(f)
                batches = batches_data.get("batches", [])
        except FileNotFoundError:
            # Fallback to batches in subjects.json if batches.json doesn't exist
            if "data" in subjects_data and subjects_data["data"]:
                batches = subjects_data["data"][0].get("batches", [])
        
        # Validate data
        if not subjects:
            raise ValueError("No subjects found in input files")
        if not teachers:
            raise ValueError("No teachers found in input files")
        
        # Validate teacher references
        teacher_ids = {t["id"] for t in teachers}
        for subject in subjects:
            if subject["teacher_id"] not in teacher_ids:
                print(f"⚠️ Warning: Teacher {subject['teacher_id']} not found for subject {subject['code']}")
        
        return {
            "teachers": teachers,
            "subjects": subjects,
            "batches": batches
        }
        
    except json.JSONDecodeError as e:
        print(f"❌ Error loading JSON files: {str(e)}")
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"❌ Missing input file: {str(e)}")
        sys.exit(1)

def print_timetable(best):
    """Print the generated timetable in a readable format."""
    print("\n✅ BEST TIMETABLE GENERATED (Detailed View):")
    for day, periods in best.items():
        print(f"\n📅 {day}:")
        for i, subject in enumerate(periods, 1):
            period_label = f"Period {i}"
            print(f"  {period_label}: {subject if subject else '---'}")
    
    print("\n✅ GA FINISHED. QUICK SUMMARY:\n")
    for day in best:
        print(f"{day}: {best[day]}")

if __name__ == "__main__":
    print("\n📥 Loading input from JSON...")
    input_data = load_combined_input()
    
    print(f"\nLoaded {len(input_data['subjects'])} subjects")
    print(f"Loaded {len(input_data['teachers'])} teachers")
    print(f"Loaded {len(input_data['batches'])} batch configurations")
    
    print("\n🔄 Running Genetic Algorithm...")
    tt = Timetable(input_data)
    tt.create_initial_population()
    best = tt.run_evolution()
    
    print_timetable(best)