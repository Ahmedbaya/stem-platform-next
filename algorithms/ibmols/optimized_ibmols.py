#!/usr/bin/env python3
"""
Optimized IBMOLS Implementation

Final optimized version combining multi-start, diverse initialization,
and effective local search to maximize Pareto solutions found.
"""

import sys
import os
import time
from typing import List, Tuple, Set

# Add the algorithms directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols.structures import (
    MOKPInstance, Individual, loadMOKP, 
    evaluate_individual, is_feasible, dominates, copy_individual
)
from ibmols.crandom import srand, rand, randint, randfloat


class OptimizedIBMOLS:
    """Optimized IBMOLS with multi-start and diverse strategies"""
    
    def __init__(self, instance: MOKPInstance):
        self.instance = instance
        self.archive: List[Individual] = []
        self.seen_solutions: Set[str] = set()  # Track unique solutions
        
    def solution_signature(self, individual: Individual) -> str:
        """Create a unique signature for a solution"""
        return f"{individual.profit1:.3f}_{individual.profit2:.3f}"
    
    def generate_greedy_solution(self, strategy: int = 0) -> Individual:
        """Generate greedy solution with different strategies"""
        solution = Individual(self.instance.n_items)
        
        if strategy == 0:
            # Greedy by profit1/weight ratio
            ratios = [self.instance.items[i].profit1 / max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        elif strategy == 1:
            # Greedy by profit2/weight ratio
            ratios = [self.instance.items[i].profit2 / max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        else:
            # Greedy by combined profit/weight ratio
            ratios = [(self.instance.items[i].profit1 + self.instance.items[i].profit2) / 
                     max(self.instance.items[i].weight, 1) 
                     for i in range(self.instance.n_items)]
        
        # Sort items by ratio
        sorted_indices = sorted(range(self.instance.n_items), key=lambda x: ratios[x], reverse=True)
        
        # Add items while feasible
        current_weight = 0
        for i in sorted_indices:
            if current_weight + self.instance.items[i].weight <= min(self.instance.capacity1, self.instance.capacity2):
                solution.chromosome[i] = 1
                current_weight += self.instance.items[i].weight
            else:
                solution.chromosome[i] = 0
        
        evaluate_individual(solution, self.instance)
        return solution
    
    def generate_random_solution(self, density: float = 0.3) -> Individual:
        """Generate random solution with given density"""
        solution = Individual(self.instance.n_items)
        
        for i in range(self.instance.n_items):
            solution.chromosome[i] = 1 if randfloat() < density else 0
        
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
    
    def local_search_2opt(self, solution: Individual, max_iterations: int = 100) -> Individual:
        """Enhanced local search with 2-opt moves"""
        current = Individual(self.instance.n_items)
        copy_individual(solution, current)
        
        iteration = 0
        while iteration < max_iterations:
            improved = False
            best_improvement = None
            best_score = current.profit1 + current.profit2
            
            # 1-opt moves (bit flips)
            for i in range(self.instance.n_items):
                neighbor = Individual(self.instance.n_items)
                copy_individual(current, neighbor)
                neighbor.chromosome[i] = 1 - neighbor.chromosome[i]
                
                evaluate_individual(neighbor, self.instance)
                
                if is_feasible(neighbor, self.instance):
                    score = neighbor.profit1 + neighbor.profit2
                    if score > best_score:
                        best_improvement = neighbor
                        best_score = score
                        improved = True
            
            # 2-opt moves (limited)
            if not improved:
                for _ in range(min(50, self.instance.n_items)):
                    i, j = randint(self.instance.n_items), randint(self.instance.n_items)
                    if i != j:
                        neighbor = Individual(self.instance.n_items)
                        copy_individual(current, neighbor)
                        neighbor.chromosome[i] = 1 - neighbor.chromosome[i]
                        neighbor.chromosome[j] = 1 - neighbor.chromosome[j]
                        
                        evaluate_individual(neighbor, self.instance)
                        
                        if is_feasible(neighbor, self.instance):
                            score = neighbor.profit1 + neighbor.profit2
                            if score > best_score:
                                best_improvement = neighbor
                                best_score = score
                                improved = True
            
            if improved and best_improvement:
                copy_individual(best_improvement, current)
                iteration += 1
            else:
                break
        
        return current
    
    def update_archive(self, solution: Individual) -> bool:
        """Update archive with new solution"""
        if not is_feasible(solution, self.instance):
            return False
        
        # Check if already seen
        sig = self.solution_signature(solution)
        if sig in self.seen_solutions:
            return False
        
        self.seen_solutions.add(sig)
        
        # Remove dominated solutions
        non_dominated = []
        for archived in self.archive:
            if not dominates(solution, archived):
                non_dominated.append(archived)
        
        # Check if solution is dominated
        for archived in non_dominated:
            if dominates(archived, solution):
                return False
        
        # Add solution to archive
        new_solution = Individual(self.instance.n_items)
        copy_individual(solution, new_solution)
        non_dominated.append(new_solution)
        self.archive = non_dominated
        return True
    
    def run_multistart(self, max_time: float = 60.0, seed: int = 12345) -> Tuple[List[Individual], int]:
        """Run multi-start IBMOLS"""
        srand(seed)
        start_time = time.time()
        
        print(f"Running Optimized Multi-Start IBMOLS for {max_time} seconds")
        
        iteration = 0
        restart_count = 0
        
        # Initial greedy solutions
        for strategy in range(3):
            if time.time() - start_time >= max_time:
                break
            greedy_solution = self.generate_greedy_solution(strategy)
            improved = self.local_search_2opt(greedy_solution, 50)
            self.update_archive(improved)
        
        while time.time() - start_time < max_time:
            # Multi-start strategy
            if iteration % 10 == 0:
                # Restart with greedy solution
                strategy = restart_count % 3
                solution = self.generate_greedy_solution(strategy)
                restart_count += 1
            elif iteration % 7 == 0:
                # High density random solution
                solution = self.generate_random_solution(0.5)
            elif iteration % 5 == 0:
                # Low density random solution
                solution = self.generate_random_solution(0.2)
            else:
                # Medium density random solution
                solution = self.generate_random_solution(0.35)
            
            # Apply local search
            if iteration % 3 == 0:
                # More intensive local search occasionally
                improved = self.local_search_2opt(solution, 150)
            else:
                improved = self.local_search_2opt(solution, 75)
            
            # Update archive
            self.update_archive(improved)
            
            iteration += 1
            
            # Progress report
            if iteration % 50 == 0:
                elapsed = time.time() - start_time
                print(f"Iteration {iteration}, Archive: {len(self.archive)}, Time: {elapsed:.1f}s")
        
        elapsed_time = time.time() - start_time
        print(f"Optimized IBMOLS completed in {elapsed_time:.2f}s")
        print(f"Final archive size: {len(self.archive)} Pareto solutions")
        print(f"Total iterations: {iteration}")
        
        return self.archive, len(self.archive)


def main():
    """Test the optimized IBMOLS implementation"""
    
    # Load instance
    instance_file = os.path.join(os.path.dirname(__file__), '..', 'data', '250.2.txt')
    instance = loadMOKP(instance_file)
    
    print(f"Loaded MOKP instance: {instance.n_items} items, {instance.n_objectives} objectives")
    print(f"Capacities: {instance.capacity1}, {instance.capacity2}")
    
    # Run algorithm
    ibmols = OptimizedIBMOLS(instance)
    solutions, count = ibmols.run_multistart(max_time=60.0, seed=12345)
    
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
    
    # Save results
    with open('optimized_results.txt', 'w') as f:
        f.write(f"Optimized IBMOLS Results\n")
        f.write(f"Solutions found: {count}\n")
        f.write(f"Pareto Front:\n")
        for sol in solutions:
            f.write(f"{sol.profit1:.6f}\t{sol.profit2:.6f}\n")
    
    return count


if __name__ == "__main__":
    main()