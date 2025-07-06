#!/usr/bin/env python3
"""
IBMOLS Debug Implementation
==========================

This module provides a comprehensive debugging version of the IBMOLS 
(IBM Online Learning System) algorithm to identify issues with the 
500.2.txt dataset that produces only 2 solutions instead of 2033.

Author: Debug Version
Date: 2024
"""

import numpy as np
import random
import time
import logging
import os
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json


class DebugLevel(Enum):
    """Debug verbosity levels"""
    NONE = 0
    BASIC = 1
    DETAILED = 2
    VERBOSE = 3
    ALL = 4


@dataclass
class DebugConfig:
    """Debug configuration settings"""
    level: DebugLevel = DebugLevel.DETAILED
    log_to_file: bool = True
    log_to_console: bool = True
    log_dir: str = "logs"
    track_rng: bool = True
    track_memory: bool = True
    validate_intermediate: bool = True
    comparison_mode: bool = False


@dataclass
class Solution:
    """Represents a solution in the optimization problem"""
    variables: np.ndarray
    objectives: np.ndarray
    rank: int = 0
    crowding_distance: float = 0.0
    dominated_count: int = 0
    dominating_solutions: List[int] = None
    
    def __post_init__(self):
        if self.dominating_solutions is None:
            self.dominating_solutions = []


@dataclass
class Problem:
    """Represents the optimization problem"""
    n_variables: int
    n_objectives: int
    variable_bounds: List[Tuple[float, float]]
    objective_coefficients: List[List[float]]
    name: str = ""


class IBMOLSDebug:
    """
    IBMOLS Algorithm with comprehensive debugging capabilities
    """
    
    def __init__(self, config: DebugConfig = None):
        self.config = config or DebugConfig()
        self.logger = self._setup_logger()
        self.problem = None
        self.population = []
        self.archive = []
        self.generation = 0
        self.debug_data = {
            'solution_count_history': [],
            'archive_size_history': [],
            'dominance_checks': [],
            'convergence_data': [],
            'rng_states': [],
            'memory_usage': [],
            'iteration_times': []
        }
        self.start_time = None
        
    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('ibmols_debug')
        logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers
        logger.handlers.clear()
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        if self.config.log_to_console:
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.INFO)
            console_handler.setFormatter(detailed_formatter)
            logger.addHandler(console_handler)
        
        # File handler
        if self.config.log_to_file:
            os.makedirs(self.config.log_dir, exist_ok=True)
            timestamp = time.strftime('%Y%m%d_%H%M%S')
            log_file = os.path.join(self.config.log_dir, f'ibmols_debug_{timestamp}.log')
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(detailed_formatter)
            logger.addHandler(file_handler)
        
        return logger
    
    def load_problem(self, filename: str) -> Problem:
        """Load problem from file with debug logging"""
        self.logger.info(f"Loading problem from {filename}")
        
        try:
            with open(filename, 'r') as f:
                lines = [line.strip() for line in f.readlines() if line.strip() and not line.startswith('#')]
            
            # Parse header
            n_variables, n_objectives = map(int, lines[0].split())
            self.logger.info(f"Problem dimensions: {n_variables} variables, {n_objectives} objectives")
            
            # Parse objectives
            objective_coefficients = []
            line_idx = 1
            
            for obj_idx in range(n_objectives):
                if line_idx < len(lines) and lines[line_idx].startswith('OBJ'):
                    line_idx += 1  # Skip OBJ line
                
                if line_idx < len(lines):
                    coeffs = list(map(float, lines[line_idx].split()))
                    if len(coeffs) != n_variables:
                        self.logger.warning(f"Objective {obj_idx} has {len(coeffs)} coefficients, expected {n_variables}")
                    objective_coefficients.append(coeffs)
                    line_idx += 1
            
            # Parse bounds
            variable_bounds = []
            bounds_started = False
            for i in range(line_idx, len(lines)):
                if lines[i] == 'BOUNDS':
                    bounds_started = True
                    continue
                if bounds_started:
                    bounds = list(map(float, lines[i].split()))
                    if len(bounds) == 2:
                        variable_bounds.append((bounds[0], bounds[1]))
            
            # Fill missing bounds with [0, 1]
            while len(variable_bounds) < n_variables:
                variable_bounds.append((0.0, 1.0))
            
            self.problem = Problem(
                n_variables=n_variables,
                n_objectives=n_objectives,
                variable_bounds=variable_bounds,
                objective_coefficients=objective_coefficients,
                name=os.path.basename(filename)
            )
            
            self.logger.info(f"Problem loaded successfully: {self.problem.name}")
            self.logger.debug(f"Variable bounds: {variable_bounds[:5]}..." if len(variable_bounds) > 5 else f"Variable bounds: {variable_bounds}")
            
            return self.problem
            
        except Exception as e:
            self.logger.error(f"Error loading problem: {e}")
            raise
    
    def evaluate_solution(self, variables: np.ndarray) -> np.ndarray:
        """Evaluate objectives for a solution with debug tracking"""
        if self.problem is None:
            raise ValueError("Problem not loaded")
        
        objectives = np.zeros(self.problem.n_objectives)
        
        for obj_idx in range(self.problem.n_objectives):
            if obj_idx < len(self.problem.objective_coefficients):
                coeffs = self.problem.objective_coefficients[obj_idx]
                objectives[obj_idx] = np.sum(np.array(coeffs[:len(variables)]) * variables)
            else:
                self.logger.warning(f"No coefficients for objective {obj_idx}")
        
        return objectives
    
    def dominates(self, sol1: Solution, sol2: Solution) -> bool:
        """Check if solution 1 dominates solution 2 with debug logging"""
        if self.config.level.value >= DebugLevel.VERBOSE.value:
            self.logger.debug(f"Dominance check: {sol1.objectives} vs {sol2.objectives}")
        
        # At least one objective must be strictly better
        at_least_one_better = False
        # All objectives must be no worse
        all_no_worse = True
        
        for i in range(len(sol1.objectives)):
            if sol1.objectives[i] < sol2.objectives[i]:
                at_least_one_better = True
            elif sol1.objectives[i] > sol2.objectives[i]:
                all_no_worse = False
                break
        
        dominates = at_least_one_better and all_no_worse
        
        if self.config.level.value >= DebugLevel.VERBOSE.value:
            self.logger.debug(f"Dominance result: {dominates}")
        
        self.debug_data['dominance_checks'].append({
            'sol1': sol1.objectives.tolist(),
            'sol2': sol2.objectives.tolist(),
            'dominates': dominates
        })
        
        return dominates
    
    def extractPtoArchive_exact(self, population: List[Solution]) -> List[Solution]:
        """
        Extract Pareto optimal solutions from population with detailed debugging
        This is the critical function that may have issues with 500.2.txt
        """
        self.logger.info(f"Extracting Pareto archive from population of size {len(population)}")
        
        if not population:
            self.logger.warning("Empty population provided to extractPtoArchive_exact")
            return []
        
        archive = []
        
        for i, candidate in enumerate(population):
            if self.config.level.value >= DebugLevel.DETAILED.value:
                self.logger.debug(f"Evaluating candidate {i}: {candidate.objectives}")
            
            is_dominated = False
            
            # Check if candidate is dominated by any solution in current archive
            for j, arch_sol in enumerate(archive):
                if self.dominates(arch_sol, candidate):
                    is_dominated = True
                    if self.config.level.value >= DebugLevel.DETAILED.value:
                        self.logger.debug(f"Candidate {i} dominated by archive solution {j}")
                    break
            
            if not is_dominated:
                # Remove solutions from archive that are dominated by candidate
                new_archive = []
                for j, arch_sol in enumerate(archive):
                    if not self.dominates(candidate, arch_sol):
                        new_archive.append(arch_sol)
                    else:
                        if self.config.level.value >= DebugLevel.DETAILED.value:
                            self.logger.debug(f"Archive solution {j} dominated by candidate {i}")
                
                new_archive.append(candidate)
                archive = new_archive
                
                if self.config.level.value >= DebugLevel.DETAILED.value:
                    self.logger.debug(f"Candidate {i} added to archive, new size: {len(archive)}")
        
        self.logger.info(f"Archive extraction complete. Final size: {len(archive)}")
        
        # Log detailed archive information
        if self.config.level.value >= DebugLevel.DETAILED.value:
            for i, sol in enumerate(archive):
                self.logger.debug(f"Archive solution {i}: {sol.objectives}")
        
        return archive
    
    def Indicator_local_search1_exact(self, population: List[Solution], 
                                     max_iterations: int = 100) -> List[Solution]:
        """
        Local search with convergence tracking
        """
        self.logger.info(f"Starting local search with {len(population)} solutions, max_iterations: {max_iterations}")
        
        current_pop = population.copy()
        iteration = 0
        converged = False
        
        while iteration < max_iterations and not converged:
            self.logger.debug(f"Local search iteration {iteration}")
            
            # Simple local search: random perturbation
            new_pop = []
            for sol in current_pop:
                new_vars = sol.variables.copy()
                
                # Random perturbation
                for i in range(len(new_vars)):
                    if random.random() < 0.1:  # 10% chance to perturb each variable
                        lower, upper = self.problem.variable_bounds[i]
                        perturbation = random.uniform(-0.1, 0.1)
                        new_vars[i] = np.clip(new_vars[i] + perturbation, lower, upper)
                
                new_objectives = self.evaluate_solution(new_vars)
                new_sol = Solution(variables=new_vars, objectives=new_objectives)
                new_pop.append(new_sol)
            
            # Check convergence (simplified)
            if iteration > 0:
                old_size = len(current_pop)
                new_size = len(new_pop)
                if abs(old_size - new_size) < 2:
                    converged = True
                    self.logger.info(f"Local search converged at iteration {iteration}")
            
            current_pop = new_pop
            iteration += 1
            
            self.debug_data['convergence_data'].append({
                'iteration': iteration,
                'population_size': len(current_pop),
                'converged': converged
            })
        
        if not converged:
            self.logger.warning(f"Local search did not converge after {max_iterations} iterations")
        
        return current_pop
    
    def initialize_population(self, size: int) -> List[Solution]:
        """Initialize population with debug verification"""
        self.logger.info(f"Initializing population of size {size}")
        
        if self.problem is None:
            raise ValueError("Problem not loaded")
        
        population = []
        
        for i in range(size):
            variables = np.zeros(self.problem.n_variables)
            
            for j in range(self.problem.n_variables):
                lower, upper = self.problem.variable_bounds[j]
                variables[j] = random.uniform(lower, upper)
            
            objectives = self.evaluate_solution(variables)
            solution = Solution(variables=variables, objectives=objectives)
            population.append(solution)
            
            if self.config.level.value >= DebugLevel.VERBOSE.value:
                self.logger.debug(f"Initialized solution {i}: vars={variables[:3]}..., objs={objectives}")
        
        self.logger.info(f"Population initialization complete")
        return population
    
    def run_ibmols(self, population_size: int = 100, max_generations: int = 50) -> List[Solution]:
        """
        Main IBMOLS algorithm with comprehensive debugging
        """
        self.logger.info(f"Starting IBMOLS with pop_size={population_size}, max_gen={max_generations}")
        self.start_time = time.time()
        
        if self.problem is None:
            raise ValueError("Problem not loaded")
        
        # Track RNG state
        if self.config.track_rng:
            self.debug_data['rng_states'].append(random.getstate())
        
        # Initialize population
        population = self.initialize_population(population_size)
        self.logger.info(f"Initial population size: {len(population)}")
        
        # Main evolution loop
        for generation in range(max_generations):
            self.generation = generation
            gen_start_time = time.time()
            
            self.logger.info(f"Generation {generation}")
            
            # Extract Pareto archive
            archive = self.extractPtoArchive_exact(population)
            
            # Perform local search
            improved_pop = self.Indicator_local_search1_exact(population)
            
            # Update population
            population = improved_pop
            
            # Track debug data
            self.debug_data['solution_count_history'].append(len(population))
            self.debug_data['archive_size_history'].append(len(archive))
            
            gen_time = time.time() - gen_start_time
            self.debug_data['iteration_times'].append(gen_time)
            
            self.logger.info(f"Generation {generation} complete: pop_size={len(population)}, "
                           f"archive_size={len(archive)}, time={gen_time:.2f}s")
            
            # Early termination check
            if len(archive) == 0:
                self.logger.warning("Empty archive, terminating early")
                break
        
        # Final archive extraction
        final_archive = self.extractPtoArchive_exact(population)
        
        total_time = time.time() - self.start_time
        self.logger.info(f"IBMOLS complete: final_archive_size={len(final_archive)}, "
                        f"total_time={total_time:.2f}s")
        
        return final_archive
    
    def get_debug_summary(self) -> Dict[str, Any]:
        """Get comprehensive debug summary"""
        return {
            'problem_name': self.problem.name if self.problem else "Not loaded",
            'final_solution_count': len(self.archive),
            'solution_count_history': self.debug_data['solution_count_history'],
            'archive_size_history': self.debug_data['archive_size_history'],
            'total_dominance_checks': len(self.debug_data['dominance_checks']),
            'convergence_iterations': len(self.debug_data['convergence_data']),
            'total_runtime': time.time() - self.start_time if self.start_time else 0,
            'iteration_times': self.debug_data['iteration_times']
        }
    
    def save_debug_data(self, filename: str):
        """Save debug data to file"""
        debug_summary = self.get_debug_summary()
        debug_summary['debug_data'] = self.debug_data
        
        with open(filename, 'w') as f:
            json.dump(debug_summary, f, indent=2, default=str)
        
        self.logger.info(f"Debug data saved to {filename}")


def main():
    """Main function for testing"""
    print("IBMOLS Debug Version - Test Mode")
    
    # Test with 250.2.txt (working dataset)
    config = DebugConfig(level=DebugLevel.DETAILED)
    ibmols = IBMOLSDebug(config)
    
    test_file = "datasets/250.2.txt"
    if os.path.exists(test_file):
        problem = ibmols.load_problem(test_file)
        solutions = ibmols.run_ibmols(population_size=50, max_generations=20)
        
        print(f"\nTest Results for {test_file}:")
        print(f"Final solution count: {len(solutions)}")
        
        # Save debug data
        ibmols.save_debug_data(f"reports/debug_{problem.name}_{int(time.time())}.json")
    else:
        print(f"Test file {test_file} not found")


if __name__ == "__main__":
    main()