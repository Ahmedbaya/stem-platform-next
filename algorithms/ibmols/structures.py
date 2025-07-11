"""
IBMOLS Data Structures and Utilities

This module contains the core data structures and utility functions
for the IBMOLS algorithm, exactly replicating the C implementation.
"""

import random
from typing import List, Optional


class MOKPItem:
    """Represents an item in the Multi-Objective Knapsack Problem"""
    def __init__(self):
        self.profit1: float = 0.0  # First objective profit
        self.profit2: float = 0.0  # Second objective profit  
        self.weight: float = 0.0   # Item weight
        self.index: int = 0        # Original item index


class MOKPInstance:
    """Represents a Multi-Objective Knapsack Problem instance"""
    def __init__(self):
        self.n_items: int = 0      # Number of items
        self.n_objectives: int = 0 # Number of objectives (typically 2)
        self.capacity1: float = 0.0  # First constraint capacity
        self.capacity2: float = 0.0  # Second constraint capacity
        self.items: List[MOKPItem] = []


class Individual:
    """Represents an individual solution in the population"""
    def __init__(self, n_items: int = 0):
        self.chromosome: List[int] = [0] * n_items  # Binary chromosome (0/1 for each item)
        self.profit1: float = 0.0    # First objective value
        self.profit2: float = 0.0    # Second objective value
        self.weight1: float = 0.0    # First constraint weight
        self.weight2: float = 0.0    # Second constraint weight
        self.explored: int = 0       # Flag to mark if explored in local search
        self.nombr: int = n_items    # Number of items


class Archive:
    """Archive for storing non-dominated solutions"""
    def __init__(self, max_size: int = 10000):
        self.solutions: List[Individual] = []
        self.max_size: int = max_size
        self.current_size: int = 0


class Population:
    """Population for the IBMOLS algorithm"""
    def __init__(self, size: int = 100, n_items: int = 0):
        self.size: int = size
        self.individuals: List[Individual] = []
        self.ind_array: List[Individual] = []  # C-style array access
        
        # Initialize population
        for i in range(size):
            ind = Individual(n_items)
            self.individuals.append(ind)
            self.ind_array.append(ind)


def loadMOKP(filename: str) -> MOKPInstance:
    """
    Load MOKP instance from file, exactly replicating C behavior.
    
    File format:
    Line 1: n_items n_objectives  
    Line 2: single value (not used in this format)
    Line 3: profit1 values for all items
    Line 4: profit2 values for all items  
    Line 5: weight values for all items
    Line 6: capacity1 capacity2
    """
    instance = MOKPInstance()
    
    try:
        with open(filename, 'r') as f:
            # Read first line: n_items n_objectives
            line1 = f.readline().strip().split()
            instance.n_items = int(line1[0])
            instance.n_objectives = int(line1[1])
            
            # Read second line: single value (skip/not used)
            f.readline()
            
            # Read profit values for objective 1
            profit1_line = f.readline().strip().split()
            profit1_values = [float(x) for x in profit1_line]
            
            # Read profit values for objective 2
            profit2_line = f.readline().strip().split()
            profit2_values = [float(x) for x in profit2_line]
            
            # Read weight values
            weight_line = f.readline().strip().split()
            weight_values = [float(x) for x in weight_line]
            
            # Read capacities
            capacity_line = f.readline().strip().split()
            instance.capacity1 = float(capacity_line[0])
            if len(capacity_line) > 1:
                instance.capacity2 = float(capacity_line[1])
            else:
                instance.capacity2 = instance.capacity1  # Same capacity for both constraints
            
            # Verify we have enough data
            if (len(profit1_values) < instance.n_items or 
                len(profit2_values) < instance.n_items or 
                len(weight_values) < instance.n_items):
                raise ValueError(f"Insufficient data: expected {instance.n_items} items")
            
            # Create items
            instance.items = []
            for i in range(instance.n_items):
                item = MOKPItem()
                item.index = i
                item.profit1 = profit1_values[i]
                item.profit2 = profit2_values[i]
                item.weight = weight_values[i]
                instance.items.append(item)
                
    except (IOError, IndexError, ValueError) as e:
        print(f"Error loading MOKP instance: {e}")
        raise
        
    return instance


def evaluate_individual(individual: Individual, instance: MOKPInstance) -> None:
    """Evaluate an individual solution, updating its objective values"""
    individual.profit1 = 0.0
    individual.profit2 = 0.0
    individual.weight1 = 0.0
    individual.weight2 = 0.0
    
    for i in range(instance.n_items):
        if individual.chromosome[i] == 1:
            individual.profit1 += instance.items[i].profit1
            individual.profit2 += instance.items[i].profit2
            individual.weight1 += instance.items[i].weight
            individual.weight2 += instance.items[i].weight


def is_feasible(individual: Individual, instance: MOKPInstance) -> bool:
    """Check if an individual solution is feasible"""
    return (individual.weight1 <= instance.capacity1 and 
            individual.weight2 <= instance.capacity2)


def dominates(ind1: Individual, ind2: Individual) -> bool:
    """Check if ind1 dominates ind2 (Pareto dominance)"""
    return ((ind1.profit1 >= ind2.profit1 and ind1.profit2 >= ind2.profit2) and
            (ind1.profit1 > ind2.profit1 or ind1.profit2 > ind2.profit2))


def copy_individual(source: Individual, target: Individual) -> None:
    """Copy individual exactly as C would do it"""
    target.nombr = source.nombr
    target.profit1 = source.profit1
    target.profit2 = source.profit2
    target.weight1 = source.weight1
    target.weight2 = source.weight2
    target.explored = source.explored
    
    # Copy chromosome
    for i in range(source.nombr):
        target.chromosome[i] = source.chromosome[i]