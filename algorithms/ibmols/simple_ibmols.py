#!/usr/bin/env python3
"""
Simple IBMOLS Implementation

A simplified but effective implementation focusing on core algorithm behavior.
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


class SimpleIBMOLS:
    """Simple IBMOLS implementation focused on effectiveness"""
    
    def __init__(self, instance: MOKPInstance):
        self.instance = instance
        self.archive: List[Individual] = []
        
    def generate_random_solution(self) -> Individual:
        """Generate a random feasible solution"""
        solution = Individual(self.instance.n_items)
        
        # Random initialization
        for i in range(self.instance.n_items):
            solution.chromosome[i] = 1 if randfloat() < 0.3 else 0
        
        evaluate_individual(solution, self.instance)
        
        # Repair if infeasible
        while not is_feasible(solution, self.instance):
            selected = [i for i in range(self.instance.n_items) if solution.chromosome[i] == 1]
            if not selected:
                break
            item_to_remove = selected[randint(len(selected))]
            solution.chromosome[item_to_remove] = 0
            evaluate_individual(solution, self.instance)
        
        return solution
    
    def local_search(self, solution: Individual) -> Individual:
        """Simple 1-exchange local search"""
        current = Individual(self.instance.n_items)
        copy_individual(solution, current)
        
        improved = True
        while improved:
            improved = False
            best_neighbor = None
            best_score = current.profit1 + current.profit2
            
            # Try flipping each bit
            for i in range(self.instance.n_items):
                neighbor = Individual(self.instance.n_items)
                copy_individual(current, neighbor)
                neighbor.chromosome[i] = 1 - neighbor.chromosome[i]
                
                evaluate_individual(neighbor, self.instance)
                
                if is_feasible(neighbor, self.instance):
                    score = neighbor.profit1 + neighbor.profit2
                    if score > best_score:
                        best_neighbor = neighbor
                        best_score = score
                        improved = True
            
            if improved and best_neighbor:
                copy_individual(best_neighbor, current)
        
        return current
    
    def update_archive(self, solution: Individual) -> None:
        """Update archive with non-dominated solutions"""
        if not is_feasible(solution, self.instance):
            return
        
        # Check for duplicates
        for archived in self.archive:
            if (abs(archived.profit1 - solution.profit1) < 0.001 and
                abs(archived.profit2 - solution.profit2) < 0.001):
                return
        
        # Remove dominated solutions
        non_dominated = []
        for archived in self.archive:
            if not dominates(solution, archived):
                non_dominated.append(archived)
        
        # Check if solution is dominated
        for archived in non_dominated:
            if dominates(archived, solution):
                return
        
        # Add solution to archive
        new_solution = Individual(self.instance.n_items)
        copy_individual(solution, new_solution)
        non_dominated.append(new_solution)
        self.archive = non_dominated
    
    def run(self, max_time: float = 60.0, seed: int = 12345) -> Tuple[List[Individual], int]:
        """Run the simple IBMOLS algorithm"""
        srand(seed)
        start_time = time.time()
        
        print(f"Running Simple IBMOLS for {max_time} seconds")
        
        iteration = 0
        while time.time() - start_time < max_time:
            # Generate random solution
            solution = self.generate_random_solution()
            
            # Apply local search
            improved_solution = self.local_search(solution)
            
            # Update archive
            self.update_archive(improved_solution)
            
            iteration += 1
            
            # Progress report
            if iteration % 100 == 0:
                elapsed = time.time() - start_time
                print(f"Iteration {iteration}, Archive: {len(self.archive)}, Time: {elapsed:.1f}s")
        
        elapsed_time = time.time() - start_time
        print(f"Simple IBMOLS completed in {elapsed_time:.2f}s")
        print(f"Final archive size: {len(self.archive)} Pareto solutions")
        
        return self.archive, len(self.archive)


def main():
    """Test the simple IBMOLS implementation"""
    
    # Load instance
    instance_file = os.path.join(os.path.dirname(__file__), '..', 'data', '250.2.txt')
    instance = loadMOKP(instance_file)
    
    print(f"Loaded MOKP instance: {instance.n_items} items, {instance.n_objectives} objectives")
    print(f"Capacities: {instance.capacity1}, {instance.capacity2}")
    
    # Run algorithm
    ibmols = SimpleIBMOLS(instance)
    solutions, count = ibmols.run(max_time=60.0, seed=12345)
    
    print(f"\nResults:")
    print(f"Number of Pareto solutions: {count}")
    
    if count >= 800:
        print("✅ EXCELLENT: Target performance achieved!")
    elif count >= 200:
        print("✅ GOOD: Reasonable performance")
    else:
        print("❌ POOR: Below target performance")
    
    # Show some solutions
    if solutions:
        print("\nSample solutions:")
        for i, sol in enumerate(solutions[:10]):
            print(f"{sol.profit1:.1f}\t{sol.profit2:.1f}")
    
    return count


if __name__ == "__main__":
    main()