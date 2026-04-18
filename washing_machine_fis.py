import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt

# Input objects
dirt_level = ctrl.Antecedent(np.arange(0, 11, 0.1), 'DirtLevel')
load_size = ctrl.Antecedent(np.arange(0, 11, 0.1), 'LoadSize')

# Output object
wash_time = ctrl.Consequent(np.arange(0, 61, 0.1), 'WashTime')

# Membership functions for DirtLevel
dirt_level['Low'] = fuzz.trimf(dirt_level.universe, [0, 0, 4])
dirt_level['Medium'] = fuzz.trimf(dirt_level.universe, [2, 5, 8])
dirt_level['High'] = fuzz.trimf(dirt_level.universe, [6, 10, 10])

# Membership functions for LoadSize
load_size['Small'] = fuzz.trimf(load_size.universe, [0, 0, 4])
load_size['Medium'] = fuzz.trimf(load_size.universe, [2, 5, 8])
load_size['Large'] = fuzz.trimf(load_size.universe, [6, 10, 10])

# Membership functions for WashTime
wash_time['Short'] = fuzz.trimf(wash_time.universe, [0, 0, 20])
wash_time['Medium'] = fuzz.trimf(wash_time.universe, [15, 30, 45])
wash_time['Long'] = fuzz.trimf(wash_time.universe, [40, 60, 60])

# Rules matching the MATLAB logic
# 1 1 1 1 1 -> If Dirt is Low and Load is Small then Wash is Short
rule1 = ctrl.Rule(dirt_level['Low'] & load_size['Small'], wash_time['Short'])
# 1 2 1 1 1 -> If Dirt is Low and Load is Medium then Wash is Short
rule2 = ctrl.Rule(dirt_level['Low'] & load_size['Medium'], wash_time['Short'])
# 1 3 2 1 1 -> If Dirt is Low and Load is Large then Wash is Medium
rule3 = ctrl.Rule(dirt_level['Low'] & load_size['Large'], wash_time['Medium'])

# 2 1 2 1 1 -> If Dirt is Medium and Load is Small then Wash is Medium
rule4 = ctrl.Rule(dirt_level['Medium'] & load_size['Small'], wash_time['Medium'])
# 2 2 2 1 1 -> If Dirt is Medium and Load is Medium then Wash is Medium
rule5 = ctrl.Rule(dirt_level['Medium'] & load_size['Medium'], wash_time['Medium'])
# 2 3 3 1 1 -> If Dirt is Medium and Load is Large then Wash is Long
rule6 = ctrl.Rule(dirt_level['Medium'] & load_size['Large'], wash_time['Long'])

# 3 1 3 1 1 -> If Dirt is High and Load is Small then Wash is Long
rule7 = ctrl.Rule(dirt_level['High'] & load_size['Small'], wash_time['Long'])
# 3 2 3 1 1 -> If Dirt is High and Load is Medium then Wash is Long
rule8 = ctrl.Rule(dirt_level['High'] & load_size['Medium'], wash_time['Long'])
# 3 3 3 1 1 -> If Dirt is High and Load is Large then Wash is Long
rule9 = ctrl.Rule(dirt_level['High'] & load_size['Large'], wash_time['Long'])

# Control System Creation
washing_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9])
washing_simulator = ctrl.ControlSystemSimulation(washing_ctrl)

# Example inputs
example_dirt = input("Enter the dirt level (0-10): ")
example_load = input("Enter the load size (0-10): ")
washing_simulator.input['DirtLevel'] = example_dirt
washing_simulator.input['LoadSize'] = example_load

# Compute
washing_simulator.compute()
predicted_wash_time = washing_simulator.output['WashTime']

print("Washing Machine Fuzzy Inference System Created Successfully.")
print("\nExample Case Study:")
print(f"Dirt Level = {example_dirt:.1f}")
print(f"Load Size  = {example_load:.1f}")
print(f"Predicted Wash Time = {predicted_wash_time:.2f} minutes")

# Uncomment below to plot graph locally if needed
# wash_time.view(sim=washing_simulator)
# plt.show()
