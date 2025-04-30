import json
import sys
import random
import copy
import argparse

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
PERIODS_PER_DAY = 6

class Timetable:
    def __init__(self, input_data, section_name):
        self.section_name = section_name
        self.input_data = input_data
        self.subjects = self.filter_subjects_by_section()
        self.population = []

    def filter_subjects_by_section(self):
        return [s for s in self.input_data["subjects"] if self.section_name in s["sections"]]

    def create_initial_population(self, size=10):
        for _ in range(size):
            chromosome = self.generate_random_timetable()
            self.population.append(chromosome)

    def generate_random_timetable(self):
        timetable = {day: [None] * PERIODS_PER_DAY for day in DAYS}

        for subject in self.subjects:
            total_hours = subject["credits"]
            if subject["is_lab"]:
                total_hours = 2  # lab block (2 periods)
            hours_assigned = 0
            attempts = 0

            while hours_assigned < total_hours and attempts < 100:
                day = random.choice(DAYS)
                if subject["is_lab"]:
                    period = random.randint(0, PERIODS_PER_DAY - 2)
                    if timetable[day][period] is None and timetable[day][period + 1] is None:
                        timetable[day][period] = subject["code"]
                        timetable[day][period + 1] = subject["code"]
                        hours_assigned += 2
                else:
                    period = random.randint(0, PERIODS_PER_DAY - 1)
                    if timetable[day][period] is None:
                        timetable[day][period] = subject["code"]
                        hours_assigned += 1
                attempts += 1
        return timetable

    def evaluate_fitness(self, timetable):
        fitness = 0
        for day, periods in timetable.items():
            seen_periods = set()
            for slot in periods:
                if slot:
                    fitness += 1
                    seen_periods.add(slot)
            if len(seen_periods) < len(periods):
                fitness -= 1
        return fitness

    def run_evolution(self, generations=10):
        for _ in range(generations):
            fitness_scores = [(tt, self.evaluate_fitness(tt)) for tt in self.population]
            fitness_scores.sort(key=lambda x: x[1], reverse=True)
            selected = [tt for tt, _ in fitness_scores[:4]]
            self.population = selected.copy()

            while len(self.population) < 10:
                parent = random.choice(selected)
                child = self.mutate(copy.deepcopy(parent))
                self.population.append(child)

        return max(self.population, key=self.evaluate_fitness)

    def mutate(self, timetable):
        day = random.choice(DAYS)
        period = random.randint(0, PERIODS_PER_DAY - 1)
        subject = random.choice(self.subjects)
        if subject["is_lab"] and period < PERIODS_PER_DAY - 1:
            if timetable[day][period] is None and timetable[day][period + 1] is None:
                timetable[day][period] = subject["code"]
                timetable[day][period + 1] = subject["code"]
        elif not subject["is_lab"]:
            timetable[day][period] = subject["code"]
        return timetable

def load_combined_input():
    try:
        with open("input/teachers.json", 'r') as f:
            teachers_data = json.load(f)
        teachers = teachers_data.get("teachers", [])

        with open("input/subjects.json", 'r') as f:
            subjects_data = json.load(f)

        subjects = []
        if "data" in subjects_data and subjects_data["data"]:
            subjects.extend(subjects_data["data"][0].get("subjects", []))
        if "subjects" in subjects_data:
            subjects.extend(subjects_data["subjects"])

        batches = []
        try:
            with open("input/batches.json", 'r') as f:
                batches_data = json.load(f)
                batches = batches_data.get("batches", [])
        except FileNotFoundError:
            if "data" in subjects_data and subjects_data["data"]:
                batches = subjects_data["data"][0].get("batches", [])

        if not subjects:
            raise ValueError("No subjects found")
        if not teachers:
            raise ValueError("No teachers found")

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
        print(f"❌ JSON decode error: {str(e)}")
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"❌ File not found: {str(e)}")
        sys.exit(1)

def print_timetable(best):
    print("\n✅ BEST TIMETABLE GENERATED:")
    for day, periods in best.items():
        print(f"\n📅 {day}:")
        for i, subject in enumerate(periods, 1):
            print(f"  Period {i}: {subject if subject else '---'}")
    print("\n📊 SUMMARY:")
    for day in best:
        print(f"{day}: {best[day]}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--section", type=str, required=True, help="Section name (e.g., 6A)")
    args = parser.parse_args()

    print("📥 Loading input...")
    input_data = load_combined_input()

    print(f"🔧 Generating timetable for section: {args.section}")
    tt = Timetable(input_data, args.section)
    tt.create_initial_population()
    best = tt.run_evolution()

    print_timetable(best)
