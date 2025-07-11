#!/usr/bin/env python3
"""
Generate a proper MOKP instance file with 250 items and 2 objectives
"""

import random

def generate_mokp_instance():
    n_items = 250
    n_objectives = 2
    
    # Set seed for reproducible data
    random.seed(42)
    
    # Generate profit values for objective 1 (range 10-100)
    profit1 = [random.randint(10, 100) for _ in range(n_items)]
    
    # Generate profit values for objective 2 (range 10-100)  
    profit2 = [random.randint(10, 100) for _ in range(n_items)]
    
    # Generate weights (range 5-50)
    weights = [random.randint(5, 50) for _ in range(n_items)]
    
    # Calculate reasonable capacities (about 40% of total weight)
    total_weight = sum(weights)
    capacity1 = int(total_weight * 0.4)
    capacity2 = int(total_weight * 0.4)
    
    # Write to file
    with open('250.2.txt', 'w') as f:
        # Line 1: n_items n_objectives
        f.write(f"{n_items} {n_objectives}\n")
        
        # Line 2: n_items (for some formats)
        f.write(f"{n_items}\n")
        
        # Line 3: profit1 values
        f.write(" ".join(map(str, profit1)) + "\n")
        
        # Line 4: profit2 values
        f.write(" ".join(map(str, profit2)) + "\n")
        
        # Line 5: weight values
        f.write(" ".join(map(str, weights)) + "\n")
        
        # Line 6: capacities
        f.write(f"{capacity1} {capacity2}\n")
    
    print(f"Generated MOKP instance with:")
    print(f"  Items: {n_items}")
    print(f"  Objectives: {n_objectives}")
    print(f"  Total weight: {total_weight}")
    print(f"  Capacities: {capacity1}, {capacity2}")

if __name__ == "__main__":
    generate_mokp_instance()