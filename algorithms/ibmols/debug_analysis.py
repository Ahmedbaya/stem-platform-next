#!/usr/bin/env python3
"""
IBMOLS Debug Analysis
Detailed analysis of why algorithm finds only 2 solutions
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols import IBMOLS, IBMOLSParameters, create_test_problem
import logging

def analyze_solution_diversity():
    """Analyze solution diversity and Pareto front exploration"""
    print("=" * 60)
    print("IBMOLS Solution Diversity Analysis")
    print("=" * 60)
    
    # Test with a smaller problem first
    params = IBMOLSParameters(
        problem_size=10,
        max_evaluations=1000,
        debug_level=3,
        nbl=50
    )
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 10)
    
    print(f"Testing ZDT1 with {params.problem_size} variables...")
    
    # Run algorithm
    solutions = algorithm.solve(problem)
    
    print(f"\nResults:")
    print(f"Total solutions found: {len(solutions)}")
    print(f"Total evaluations: {algorithm.evaluation_count}")
    
    # Analyze solution diversity
    print(f"\nSolution Analysis:")
    for i, sol in enumerate(solutions):
        print(f"Solution {i+1}:")
        print(f"  Variables: {sol.variables}")
        print(f"  Objectives: {sol.objectives}")
        print(f"  f1={sol.objectives[0]:.6f}, f2={sol.objectives[1]:.6f}")
    
    # Test different variable combinations manually
    print(f"\nManual ZDT1 Evaluation Test:")
    test_solutions = [
        [0] * 10,  # All zeros
        [1] * 10,  # All ones
        [1] + [0] * 9,  # First bit 1, rest 0
        [0] + [1] * 9,  # First bit 0, rest 1
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],  # Alternating
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],  # Alternating
    ]
    
    for i, variables in enumerate(test_solutions):
        objectives = problem.evaluate(variables)
        print(f"Test {i+1}: vars={variables} -> f1={objectives[0]:.6f}, f2={objectives[1]:.6f}")
    
    return len(solutions)

def analyze_local_search():
    """Analyze local search behavior"""
    print("=" * 60)
    print("Local Search Analysis") 
    print("=" * 60)
    
    # Create a simple test case
    params = IBMOLSParameters(problem_size=5, debug_level=3)
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 5)
    
    # Test local search manually
    from ibmols.ibmols import Solution
    
    base_solution = Solution([1, 0, 0, 0, 0])
    algorithm._evaluate_solution(base_solution, problem)
    
    print(f"Base solution: {base_solution.variables} -> {base_solution.objectives}")
    
    # Generate neighbors
    for i in range(5):
        neighbor = algorithm._generate_neighbor(base_solution)
        algorithm._evaluate_solution(neighbor, problem)
        dominates = neighbor.dominates(base_solution)
        dominated_by = base_solution.dominates(neighbor)
        print(f"Neighbor {i}: {neighbor.variables} -> {neighbor.objectives} "
              f"(dominates base: {dominates}, dominated by base: {dominated_by})")

def analyze_archive_updates():
    """Analyze archive update behavior"""
    print("=" * 60)
    print("Archive Update Analysis")
    print("=" * 60)
    
    params = IBMOLSParameters(problem_size=5, debug_level=3)
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 5)
    
    from ibmols.ibmols import Solution
    
    # Test archive updates with various solutions
    test_solutions = [
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0], 
        [0, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1],
    ]
    
    for variables in test_solutions:
        solution = Solution(variables)
        algorithm._evaluate_solution(solution, problem)
        
        old_size = len(algorithm.archive)
        algorithm._update_archive(solution)
        new_size = len(algorithm.archive)
        
        print(f"Solution {variables} -> {solution.objectives}")
        print(f"  Archive: {old_size} -> {new_size}")
        print(f"  Current archive objectives: {[s.objectives for s in algorithm.archive]}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    
    print("Starting IBMOLS Debug Analysis...")
    
    try:
        solutions = analyze_solution_diversity()
        print(f"\nDiversity test found {solutions} solutions")
        
        analyze_local_search()
        analyze_archive_updates()
        
    except Exception as e:
        print(f"Error during analysis: {e}")
        import traceback
        traceback.print_exc()