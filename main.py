import sys
import random
import pandas as pd
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout, QTableWidget, QTableWidgetItem, QLabel

# --- Constants ---
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
TIME_SLOTS = [
    '8:30-9:30', '9:30-10:30', 'Tea Break',
    '10:45-11:45', '11:45-12:45', 'Lunch Break',
    '1:30-2:30', '2:30-3:30', '3:30-4:30'
]

subjects_teachers = {
    'Software Engineering': 'KG',
    'NLP': 'SJ',
    'Image Processing': 'SK',
    'Cloud Computing': 'GK',
    'Big Data Analytics': 'RS',
    'Project Work': 'DSP',
    '3D Animation': 'SNR',
    'OEC': 'OEC'
}

# --- Timetable Logic ---
def get_available_slots():
    return [(day, time) for day in DAYS for time in TIME_SLOTS if time not in ['Tea Break', 'Lunch Break']]

AVAILABLE_SLOTS = get_available_slots()

def create_initial_population(size):
    population = []
    for _ in range(size):
        timetable = []
        slots = AVAILABLE_SLOTS.copy()
        random.shuffle(slots)
        for slot in slots:
            if random.random() < 0.7:
                subject = random.choice(list(subjects_teachers.keys()))
                teacher = subjects_teachers[subject]
                timetable.append((slot[0], slot[1], subject, teacher))
        population.append(timetable)
    return population

def calculate_fitness(timetable):
    score = 1000
    used = set()
    for entry in timetable:
        key = (entry[3], entry[0], entry[1])
        if key in used:
            score -= 20
        used.add(key)
    return score

def selection(population):
    return sorted(population, key=calculate_fitness, reverse=True)[:len(population)//2]

def crossover(p1, p2):
    cut = len(p1) // 2
    return p1[:cut] + p2[cut:]

def mutate(timetable):
    if timetable:
        idx = random.randint(0, len(timetable)-1)
        day, time, _, _ = timetable[idx]
        subject = random.choice(list(subjects_teachers.keys()))
        teacher = subjects_teachers[subject]
        timetable[idx] = (day, time, subject, teacher)
    return timetable

def genetic_algorithm(generations=100, population_size=10):
    population = create_initial_population(population_size)
    for _ in range(generations):
        population = selection(population)
        next_gen = []
        while len(next_gen) < population_size:
            p1, p2 = random.sample(population, 2)
            child = crossover(p1, p2)
            if random.random() < 0.1:
                child = mutate(child)
            next_gen.append(child)
        population = next_gen
    return max(population, key=calculate_fitness)

# --- PyQt GUI ---
class TimetableApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Smart Timetable Generator")
        self.setGeometry(100, 100, 900, 500)

        self.layout = QVBoxLayout()
        self.setLayout(self.layout)

        self.title = QLabel("Smart Timetable Generator", self)
        self.title.setStyleSheet("font-size: 20px; font-weight: bold; margin-bottom: 10px;")
        self.layout.addWidget(self.title)

        self.button = QPushButton("Generate Timetable")
        self.button.clicked.connect(self.display_timetable)
        self.layout.addWidget(self.button)

        self.table = QTableWidget()
        self.layout.addWidget(self.table)

    def display_timetable(self):
        best_timetable = genetic_algorithm()

        # Create an empty grid with all slots
        timetable_dict = {(day, time): "" for day in DAYS for time in TIME_SLOTS}
        for (day, time, subject, teacher) in best_timetable:
            timetable_dict[(day, time)] = f"{subject}\n{teacher}"

        self.table.setRowCount(len(DAYS))
        self.table.setColumnCount(len(TIME_SLOTS))
        self.table.setHorizontalHeaderLabels(TIME_SLOTS)
        self.table.setVerticalHeaderLabels(DAYS)

        for row, day in enumerate(DAYS):
            for col, time in enumerate(TIME_SLOTS):
                item = QTableWidgetItem(timetable_dict[(day, time)])
                self.table.setItem(row, col, item)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = TimetableApp()
    window.show()
    sys.exit(app.exec_())
