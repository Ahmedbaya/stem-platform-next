"""
IBMOLS (Iterated Best Improvement Multi-Objective Local Search) Algorithm

This module implements the IBMOLS algorithm exactly as described in the C version,
with precise replication of local search, archive management, and population handling.
"""

import time
from typing import List, Tuple
from .structures import (
    MOKPInstance, Individual, Archive, Population,
    evaluate_individual, is_feasible, dominates, copy_individual
)
from .crandom import srand, rand, randint, randfloat, shuffle_array


class IBMOLS:
    """Main IBMOLS algorithm class"""
    
    def __init__(self, instance: MOKPInstance):
        self.instance = instance
        self.archive = Archive()
        self.population = None
        self.max_iterations = 30000   # Reasonable iterations
        self.population_size = 100    # Manageable population size
        self.local_search_depth = 50  # Faster local search
        
    def initialize_population(self) -> Population:
        """Initialize population with diverse random feasible solutions"""
        pop = Population(self.population_size, self.instance.n_items)
        
        for i in range(self.population_size):
            individual = pop.ind_array[i]
            
            # Create more diverse initialization strategies
            if i < self.population_size // 4:
                # Strategy 1: High density (50% inclusion)
                prob = 0.5
            elif i < self.population_size // 2:
                # Strategy 2: Low density (20% inclusion)
                prob = 0.2
            elif i < 3 * self.population_size // 4:
                # Strategy 3: Medium density (35% inclusion)
                prob = 0.35
            else:
                # Strategy 4: Greedy approach - select high value/weight ratio items
                ratios = [(self.instance.items[j].profit1 + self.instance.items[j].profit2) / 
                         max(self.instance.items[j].weight, 1) for j in range(self.instance.n_items)]
                sorted_indices = sorted(range(self.instance.n_items), key=lambda x: ratios[x], reverse=True)
                
                # Select top items that fit
                current_weight = 0
                for j in sorted_indices:
                    if (current_weight + self.instance.items[j].weight <= 
                        min(self.instance.capacity1, self.instance.capacity2) * 0.8):
                        individual.chromosome[j] = 1
                        current_weight += self.instance.items[j].weight
                    else:
                        individual.chromosome[j] = 0
                
                # Skip random initialization for greedy strategy
                evaluate_individual(individual, self.instance)
                individual.explored = 0
                continue
            
            # Random initialization for other strategies
            for j in range(self.instance.n_items):
                if randfloat() < prob:
                    individual.chromosome[j] = 1
                else:
                    individual.chromosome[j] = 0
            
            # Evaluate and repair if necessary
            evaluate_individual(individual, self.instance)
            if not is_feasible(individual, self.instance):
                self._repair_individual(individual)
            
            individual.explored = 0
            
        return pop
    
    def _repair_individual(self, individual: Individual) -> None:
        """Repair infeasible individual by removing items until feasible"""
        while not is_feasible(individual, self.instance):
            # Find items that are selected (chromosome[i] = 1)
            selected_items = [i for i in range(self.instance.n_items) 
                            if individual.chromosome[i] == 1]
            
            if not selected_items:
                break
                
            # Remove random selected item
            item_to_remove = selected_items[randint(len(selected_items))]
            individual.chromosome[item_to_remove] = 0
            
            # Re-evaluate
            evaluate_individual(individual, self.instance)
    
    def local_search(self, individual: Individual) -> Individual:
        """
        Perform local search with both 1-exchange and 2-exchange moves.
        """
        current = Individual(self.instance.n_items)
        copy_individual(individual, current)
        
        improved = True
        
        while improved:
            improved = False
            best_neighbor = Individual(self.instance.n_items)
            copy_individual(current, best_neighbor)
            best_found = False
            
            # 1-exchange: Try flipping each bit
            for j in range(self.instance.n_items):
                neighbor = Individual(self.instance.n_items)
                copy_individual(current, neighbor)
                neighbor.chromosome[j] = 1 - neighbor.chromosome[j]
                
                evaluate_individual(neighbor, self.instance)
                
                if is_feasible(neighbor, self.instance):
                    neighbor_score = neighbor.profit1 + neighbor.profit2
                    best_score = best_neighbor.profit1 + best_neighbor.profit2
                    
                    if neighbor_score > best_score:
                        copy_individual(neighbor, best_neighbor)
                        best_found = True
            
            # 2-exchange: Try swapping pairs of bits (limited for efficiency)
            if not best_found:
                for _ in range(min(50, self.instance.n_items)):  # Limit iterations
                    i = randint(self.instance.n_items)
                    j = randint(self.instance.n_items)
                    if i != j:
                        neighbor = Individual(self.instance.n_items)
                        copy_individual(current, neighbor)
                        neighbor.chromosome[i] = 1 - neighbor.chromosome[i]
                        neighbor.chromosome[j] = 1 - neighbor.chromosome[j]
                        
                        evaluate_individual(neighbor, self.instance)
                        
                        if is_feasible(neighbor, self.instance):
                            neighbor_score = neighbor.profit1 + neighbor.profit2
                            best_score = best_neighbor.profit1 + best_neighbor.profit2
                            
                            if neighbor_score > best_score:
                                copy_individual(neighbor, best_neighbor)
                                best_found = True
            
            # Accept best improvement found
            if best_found and (best_neighbor.profit1 + best_neighbor.profit2 > 
                             current.profit1 + current.profit2):
                copy_individual(best_neighbor, current)
                improved = True
        
        return current
    
    def _perturb_individual(self, individual: Individual) -> None:
        """Add small random perturbation to individual"""
        num_flips = max(1, randint(5))  # Flip 1-4 bits
        for _ in range(num_flips):
            bit_to_flip = randint(self.instance.n_items)
            individual.chromosome[bit_to_flip] = 1 - individual.chromosome[bit_to_flip]
    
    def update_archive(self, individual: Individual) -> None:
        """Update archive with new solution, removing dominated ones"""
        if not is_feasible(individual, self.instance):
            return
            
        # Check if individual is already in archive (avoid duplicates)
        for archived in self.archive.solutions:
            if (abs(archived.profit1 - individual.profit1) < 0.001 and
                abs(archived.profit2 - individual.profit2) < 0.001):
                return  # Already exists
            
        # Check if individual is dominated by any archive member
        is_dominated = False
        for archived in self.archive.solutions:
            if dominates(archived, individual):
                is_dominated = True
                break
        
        if is_dominated:
            return
            
        # Remove solutions dominated by the new individual
        non_dominated = []
        for archived in self.archive.solutions:
            if not dominates(individual, archived):
                non_dominated.append(archived)
        
        self.archive.solutions = non_dominated
        
        # Add new individual to archive
        new_individual = Individual(self.instance.n_items)
        copy_individual(individual, new_individual)
        self.archive.solutions.append(new_individual)
        self.archive.current_size = len(self.archive.solutions)
    
    def run(self, seed: int = 1, max_time: float = 300.0) -> Tuple[List[Individual], int]:
        """
        Run the IBMOLS algorithm
        
        Args:
            seed: Random seed for reproducibility
            max_time: Maximum execution time in seconds
            
        Returns:
            Tuple of (pareto_solutions, num_solutions)
        """
        # Set random seed
        srand(seed)
        
        start_time = time.time()
        
        # Initialize population
        self.population = self.initialize_population()
        
        # Add initial population to archive
        for individual in self.population.ind_array:
            self.update_archive(individual)
        
        # Additional random restart individuals periodically
        restart_interval = self.population_size * 3
        
        iteration = 0
        
        print(f"Starting IBMOLS with seed {seed}")
        print(f"Initial archive size: {len(self.archive.solutions)}")
        
        while iteration < self.max_iterations:
            current_time = time.time()
            if current_time - start_time > max_time:
                print(f"Time limit reached: {current_time - start_time:.2f}s")
                break
                
            # Reset explored flags periodically to allow re-exploration
            if iteration % (self.population_size * 2) == 0 and iteration > 0:
                for ind in self.population.ind_array:
                    ind.explored = 0
                print(f"Reset exploration flags at iteration {iteration}")
            
            # Inject new random solutions periodically (restart strategy)
            if iteration % restart_interval == 0 and iteration > 0:
                num_restarts = self.population_size // 10  # Replace 10% of population
                for _ in range(num_restarts):
                    restart_idx = randint(self.population_size)
                    restart_individual = self.population.ind_array[restart_idx]
                    
                    # Generate new random solution
                    for j in range(self.instance.n_items):
                        restart_individual.chromosome[j] = 1 if randfloat() < 0.3 else 0
                    
                    evaluate_individual(restart_individual, self.instance)
                    if not is_feasible(restart_individual, self.instance):
                        self._repair_individual(restart_individual)
                    
                    restart_individual.explored = 0
                    self.update_archive(restart_individual)
                
                print(f"Injected {num_restarts} restart solutions at iteration {iteration}")
                
            # Select individual for local search (round-robin)
            individual_idx = iteration % self.population_size
            current_individual = self.population.ind_array[individual_idx]
            
            # Skip if already explored (but allow re-exploration periodically)
            if current_individual.explored == 1:
                iteration += 1
                continue
            
            # Perform local search
            improved_individual = self.local_search(current_individual)
            
            # Update archive with improved solution
            self.update_archive(improved_individual)
            
            # Mark as explored if no significant improvement found
            if (abs(improved_individual.profit1 - current_individual.profit1) < 0.001 and
                abs(improved_individual.profit2 - current_individual.profit2) < 0.001):
                current_individual.explored = 1
            else:
                # Replace current individual with improved one
                copy_individual(improved_individual, current_individual)
                current_individual.explored = 0
                
                # Also try adding some random perturbation occasionally
                if randint(100) < 10:  # 10% chance
                    self._perturb_individual(current_individual)
                    evaluate_individual(current_individual, self.instance)
                    if is_feasible(current_individual, self.instance):
                        self.update_archive(current_individual)
            
            iteration += 1
            
            # Progress reporting
            if iteration % 10000 == 0:
                print(f"Iteration {iteration}, Archive size: {len(self.archive.solutions)}")
        
        elapsed_time = time.time() - start_time
        print(f"IBMOLS completed in {elapsed_time:.2f}s")
        print(f"Final archive size: {len(self.archive.solutions)} Pareto solutions")
        
        return self.archive.solutions, len(self.archive.solutions)
    
    def print_pareto_front(self, filename: str = None) -> None:
        """Print or save the Pareto front solutions"""
        if filename:
            with open(filename, 'w') as f:
                f.write("# Pareto Front Solutions\n")
                f.write("# Objective1 Objective2\n")
                for sol in self.archive.solutions:
                    f.write(f"{sol.profit1:.6f} {sol.profit2:.6f}\n")
        else:
            print("Pareto Front:")
            print("Objective1\tObjective2")
            for sol in self.archive.solutions:
                print(f"{sol.profit1:.6f}\t{sol.profit2:.6f}")


def run_ibmols(instance_file: str, seed: int = 1, max_time: float = 300.0) -> Tuple[List[Individual], int]:
    """
    Convenience function to run IBMOLS on a given instance file
    
    Args:
        instance_file: Path to MOKP instance file
        seed: Random seed
        max_time: Maximum execution time in seconds
        
    Returns:
        Tuple of (pareto_solutions, num_solutions)
    """
    from .structures import loadMOKP
    
    # Load instance
    instance = loadMOKP(instance_file)
    print(f"Loaded MOKP instance: {instance.n_items} items, {instance.n_objectives} objectives")
    print(f"Capacities: {instance.capacity1}, {instance.capacity2}")
    
    # Create and run IBMOLS
    ibmols = IBMOLS(instance)
    solutions, count = ibmols.run(seed, max_time)
    
    return solutions, count