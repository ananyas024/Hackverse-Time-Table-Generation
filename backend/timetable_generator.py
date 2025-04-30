import json
import sys
import random
import copy
import argparse
import os
import matplotlib.pyplot as plt
import sqlite3

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
PERIODS_PER_DAY = 6

def load_combined_input():
    conn = sqlite3.connect('timetable.db')
    cursor = conn.cursor()

    # Fetch teachers' data
    cursor.execute("SELECT id, name, subjectCode, subjectName, credits, isLab, sections FROM teachers")
    teachers_data = cursor.fetchall()

    # Fetch batches' data
    cursor.execute("SELECT id, year, section, subjectCodes FROM batches")
    batches_data = cursor.fetchall()

    conn.close()

    # Process the data into appropriate structures
    teachers = []
    for row in teachers_data:
        teacher = {
            'id': row[0],
            'name': row[1],
            'code': row[2],
            'subject_name': row[3],
            'credits': row[4],
            'is_lab': bool(row[5]),
            'sections': [s.strip() for s in row[6].split(',')],
        }
        teachers.append(teacher)

    batches = []
    for row in batches_data:
        batch = {
            'id': row[0],
            'year': row[1],
            'section': row[2],
            'subject_codes': [s.strip() for s in row[3].split(',')],
        }
        batches.append(batch)

    # Build subjects list for timetable generation
    subjects = []
    for teacher in teachers:
        for section in teacher['sections']:
            subjects.append({
                'code': teacher['code'],
                'subject_name': teacher['subject_name'],
                'credits': teacher['credits'],
                'is_lab': teacher['is_lab'],
                'teacher_name': teacher['name'],
                'sections': [section],
            })

    return {'teachers': teachers, 'batches': batches, 'subjects': subjects}

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

def save_timetable_as_image(timetable, section):
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.axis('tight')
    ax.axis('off')

    table_data = [['Day'] + [f'P{i+1}' for i in range(PERIODS_PER_DAY)]]
    for day in DAYS:
        row = [day] + [timetable[day][i] if timetable[day][i] else "---" for i in range(PERIODS_PER_DAY)]
        table_data.append(row)

    table = ax.table(cellText=table_data, cellLoc='center', loc='center')
    table.scale(1, 2)
    table.auto_set_font_size(False)
    table.set_fontsize(12)

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{section}_timetable.png")
    plt.title(f"Timetable for Section {section}")
    plt.savefig(filepath, bbox_inches='tight')
    print(f"\n🖼️ Timetable image saved to: {filepath}")

def print_timetable(best):
    print("\n✅ BEST TIMETABLE GENERATED:")
    for day, periods in best.items():
        print(f"\n📅 {day}:")
        for i, subject in enumerate(periods, 1):
            print(f"  Period {i}: {subject if subject else '---'}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--section", type=str, required=True, help="Section name (e.g., 6A)")
    args = parser.parse_args()

    print("📥 Loading input...")
    input_data = load_combined_input()

    print(f"🔧 Generating timetable for section: {args.section}")
    tt = Timetable(input_data, args.section)
    if not tt.subjects:
        print(f"❌ No subjects found for section '{args.section}'. Please check your teachers table.")
        sys.exit(1)
    tt.create_initial_population()
    best = tt.run_evolution()

    print_timetable(best)
    save_timetable_as_image(best, args.section)