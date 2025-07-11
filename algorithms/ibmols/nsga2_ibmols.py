#!/usr/bin/env python3
"""
NSGA-II Style IBMOLS Implementation

Implementation using NSGA-II concepts for better multi-objective optimization.
"""

import sys
import os
import time
from typing import List, Tuple

# Add the algorithms directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols.structures import (
    MOKPInstance, Individual, loadMOKP, 
    evaluate_individual, is_feasible, dominates, copy_individual
)
from ibmols.crandom import srand, rand, randint, randfloat


def fast_non_dominated_sort(population: List[Individual]) -> List[List[Individual]]:
    """Fast non-dominated sorting algorithm from NSGA-II"""
    fronts = [[]]
    domination_count = [0] * len(population)
    dominated_solutions = [[] for _ in range(len(population))]
    
    for i, p in enumerate(population):
        for j, q in enumerate(population):
            if i != j:
                if dominates(p, q):
                    dominated_solutions[i].append(j)
                elif dominates(q, p):
                    domination_count[i] += 1
        
        if domination_count[i] == 0:
            fronts[0].append(p)
    
    front_index = 0
    while len(fronts[front_index]) > 0:
        next_front = []
        for p_index in range(len(population)):
            if population[p_index] in fronts[front_index]:
                for q_index in dominated_solutions[p_index]:
                    domination_count[q_index] -= 1
                    if domination_count[q_index] == 0:
                        next_front.append(population[q_index])
        
        front_index += 1
        fronts.append(next_front)
    
    return fronts[:-1]  # Remove empty last front


class NSGA2IBMOLS:
    """NSGA-II style IBMOLS for better multi-objective performance"""
    
    def __init__(self, instance: MOKPInstance):
        self.instance = instance
        self.population_size = 200
        self.archive: List[Individual] = []
        
    def generate_initial_population(self) -> List[Individual]:
        """Generate diverse initial population"""
        population = []
        
        # Different strategies for diversity
        strategies = [
            (0.2, "low"),     # Low density
            (0.3, "medium"),  # Medium density  
            (0.4, "high"),    # High density
            (0.5, "very_high") # Very high density
        ]
        
        for i in range(self.population_size):
            strategy_idx = i % len(strategies)
            density, name = strategies[strategy_idx]
            
            if i < 10:
                # Some greedy solutions
                solution = self.generate_greedy_solution(i % 3)
            else:
                solution = Individual(self.instance.n_items)
                
                # Random initialization
                for j in range(self.instance.n_items):
                    solution.chromosome[j] = 1 if randfloat() < density else 0
                
                evaluate_individual(solution, self.instance)
                
                # Repair if needed
                if not is_feasible(solution, self.instance):
                    self.repair_solution(solution)
            
            population.append(solution)
        
        return population
    
    def generate_greedy_solution(self, strategy: int) -> Individual:
        """Generate greedy solution"""
        solution = Individual(self.instance.n_items)
        
        if strategy == 0:
            ratios = [self.instance.items[i].profit1 / max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        elif strategy == 1:
            ratios = [self.instance.items[i].profit2 / max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        else:
            ratios = [(self.instance.items[i].profit1 + self.instance.items[i].profit2) / 
                     max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        
        sorted_indices = sorted(range(self.instance.n_items), key=lambda x: ratios[x], reverse=True)
        
        current_weight = 0
        for i in sorted_indices:
            if current_weight + self.instance.items[i].weight <= min(self.instance.capacity1, self.instance.capacity2):
                solution.chromosome[i] = 1
                current_weight += self.instance.items[i].weight
            else:
                solution.chromosome[i] = 0
        
        evaluate_individual(solution, self.instance)
        return solution
    
    def repair_solution(self, solution: Individual):
        """Repair infeasible solution"""
        while not is_feasible(solution, self.instance):
            selected = [i for i in range(self.instance.n_items) if solution.chromosome[i] == 1]
            if not selected:
                break
            item_to_remove = selected[randint(len(selected))]
            solution.chromosome[item_to_remove] = 0
            evaluate_individual(solution, self.instance)
    
    def local_search(self, solution: Individual) -> Individual:
        """Simple but effective local search"""
        current = Individual(self.instance.n_items)
        copy_individual(solution, current)
        
        improved = True
        max_iterations = 20  # Limit for efficiency
        iteration = 0
        
        while improved and iteration < max_iterations:
            improved = False
            iteration += 1
            
            # Try small number of random moves
            for _ in range(min(20, self.instance.n_items)):
                i = randint(self.instance.n_items)
                
                neighbor = Individual(self.instance.n_items)
                copy_individual(current, neighbor)
                neighbor.chromosome[i] = 1 - neighbor.chromosome[i]
                
                evaluate_individual(neighbor, self.instance)
                
                if is_feasible(neighbor, self.instance):
                    # Multi-objective improvement check
                    if (dominates(neighbor, current) or 
                        (not dominates(current, neighbor) and 
                         neighbor.profit1 + neighbor.profit2 > current.profit1 + current.profit2)):
                        copy_individual(neighbor, current)
                        improved = True
                        break
        
        return current
    
    def update_archive(self, population: List[Individual]):
        """Update archive with first front"""
        # Get all feasible solutions
        feasible = [ind for ind in population if is_feasible(ind, self.instance)]
        
        if not feasible:
            return
        
        # Add to existing archive
        combined = self.archive + feasible
        
        # Remove exact duplicates
        unique_solutions = []
        seen_signatures = set()
        
        for sol in combined:
            sig = f"{sol.profit1:.3f}_{sol.profit2:.3f}"
            if sig not in seen_signatures:
                seen_signatures.add(sig)
                unique_solutions.append(sol)
        
        # Get non-dominated front
        if unique_solutions:
            fronts = fast_non_dominated_sort(unique_solutions)
            if fronts:
                self.archive = fronts[0]  # Keep only first front
    
    def run(self, max_time: float = 60.0, seed: int = 12345) -> Tuple[List[Individual], int]:
        """Run NSGA-II style IBMOLS"""
        srand(seed)
        start_time = time.time()
        
        print(f"Running NSGA-II Style IBMOLS for {max_time} seconds")
        
        # Initialize population
        population = self.generate_initial_population()
        
        # Apply local search to initial population
        for i in range(len(population)):
            population[i] = self.local_search(population[i])
        
        self.update_archive(population)
        
        generation = 0
        
        while time.time() - start_time < max_time:
            # Generate new solutions
            new_population = []
            
            # Keep some existing solutions
            for i in range(self.population_size // 2):
                if i < len(population):
                    new_population.append(population[i])
            
            # Generate new random solutions
            while len(new_population) < self.population_size:
                if randint(10) < 3:  # 30% greedy
                    solution = self.generate_greedy_solution(randint(3))
                else:  # 70% random
                    solution = Individual(self.instance.n_items)
                    density = 0.2 + randfloat() * 0.3  # Random density 0.2-0.5
                    
                    for j in range(self.instance.n_items):
                        solution.chromosome[j] = 1 if randfloat() < density else 0
                    
                    evaluate_individual(solution, self.instance)
                    if not is_feasible(solution, self.instance):
                        self.repair_solution(solution)
                
                # Apply local search
                solution = self.local_search(solution)
                new_population.append(solution)
            
            population = new_population
            self.update_archive(population)
            
            generation += 1
            
            if generation % 10 == 0:
                elapsed = time.time() - start_time
                print(f"Generation {generation}, Archive: {len(self.archive)}, Time: {elapsed:.1f}s")
        
        elapsed_time = time.time() - start_time
        print(f"NSGA-II IBMOLS completed in {elapsed_time:.2f}s")
        print(f"Final archive size: {len(self.archive)} Pareto solutions")
        print(f"Total generations: {generation}")
        
        return self.archive, len(self.archive)


def main():
    """Test the NSGA-II style IBMOLS"""
    
    # Load instance
    instance_file = os.path.join(os.path.dirname(__file__), '..', 'data', '250.2.txt')
    instance = loadMOKP(instance_file)
    
    print(f"Loaded MOKP instance: {instance.n_items} items, {instance.n_objectives} objectives")
    print(f"Capacities: {instance.capacity1}, {instance.capacity2}")
    
    # Run algorithm
    ibmols = NSGA2IBMOLS(instance)
    solutions, count = ibmols.run(max_time=60.0, seed=12345)
    
    print(f"\nResults:")
    print(f"Number of Pareto solutions: {count}")
    
    if count >= 800:
        print("✅ EXCELLENT: Target performance achieved!")
    elif count >= 200:
        print("✅ GOOD: Reasonable performance")  
    elif count >= 50:
        print("⚠️  FAIR: Moderate performance")
    else:
        print("❌ POOR: Below target performance")
    
    # Show sample solutions
    if solutions:
        print("\nSample solutions (first 10):")
        print("Objective1\tObjective2")
        for i, sol in enumerate(solutions[:10]):
            print(f"{sol.profit1:.1f}\t\t{sol.profit2:.1f}")
    
    return count


if __name__ == "__main__":
    main()