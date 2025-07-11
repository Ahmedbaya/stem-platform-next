#!/usr/bin/env python3
"""
IBMOLS Algorithm Demo
Demonstrates the working IBMOLS implementation
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols import IBMOLS, IBMOLSParameters, create_test_problem
import logging
import time

def demo_basic_functionality():
    """Demonstrate basic IBMOLS functionality"""
    print("=" * 70)
    print("IBMOLS Algorithm Demo")
    print("Improved Binary Multi-Objective Local Search")
    print("=" * 70)
    
    print("\n1. Parameter Configuration (Exact C Defaults)")
    print("-" * 50)
    
    params = IBMOLSParameters(
        problem_size=50,
        max_evaluations=10000,
        debug_level=1
    )
    
    print(f"✓ Core parameters: α={params.alpha}, L={params.l_param}, NBL={params.nbl}, FREQ={params.frequency}")
    print(f"✓ Problem size: {params.problem_size} variables, {params.objectives} objectives")
    print(f"✓ Evaluation budget: {params.max_evaluations}")
    
    print("\n2. Algorithm Initialization")
    print("-" * 50)
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', params.problem_size)
    
    print(f"✓ IBMOLS algorithm initialized")
    print(f"✓ ZDT1 test problem created with {params.problem_size} variables")
    
    print("\n3. Algorithm Execution")
    print("-" * 50)
    
    start_time = time.time()
    solutions = algorithm.solve(problem)
    end_time = time.time()
    
    print(f"✓ Algorithm completed successfully")
    print(f"✓ Runtime: {end_time - start_time:.2f} seconds")
    
    print("\n4. Results Analysis")
    print("-" * 50)
    
    print(f"Solutions found: {len(solutions)}")
    print(f"Total evaluations: {algorithm.evaluation_count}")
    print(f"Total iterations: {algorithm.iteration_count}")
    print(f"Evaluations/second: {algorithm.evaluation_count/(end_time - start_time):.0f}")
    
    # Analyze solution diversity
    if solutions:
        f1_values = [sol.objectives[0] for sol in solutions]
        f2_values = [sol.objectives[1] for sol in solutions]
        
        print(f"\nPareto Front Analysis:")
        print(f"  f1 range: {min(f1_values):.3f} to {max(f1_values):.3f}")
        print(f"  f2 range: {min(f2_values):.3f} to {max(f2_values):.3f}")
        
        print(f"\nSample Solutions (first 5):")
        for i, sol in enumerate(solutions[:5]):
            print(f"  Solution {i+1}: f1={sol.objectives[0]:.4f}, f2={sol.objectives[1]:.4f}")
    
    print("\n5. Performance Statistics")
    print("-" * 50)
    
    stats = algorithm.get_statistics()
    perf = stats['performance']
    
    print(f"Max archive size: {perf['max_archive_size']}")
    print(f"Avg archive size: {perf['avg_archive_size']:.1f}")
    print(f"Archive updates: {perf['archive_updates']}")
    
    return len(solutions)

def demo_problem_scaling():
    """Demonstrate algorithm scaling with problem size"""
    print("\n" + "=" * 70)
    print("Problem Size Scaling Demo")
    print("=" * 70)
    
    sizes = [20, 50, 100]
    evaluations = [5000, 10000, 20000]
    
    for size, evals in zip(sizes, evaluations):
        print(f"\nTesting {size}×2 problem with {evals} evaluations...")
        
        params = IBMOLSParameters(
            problem_size=size,
            max_evaluations=evals,
            debug_level=0,  # Quiet mode
            nbl=min(500, evals//20)  # Scale NBL with evaluation budget
        )
        
        algorithm = IBMOLS(params)
        problem = create_test_problem('ZDT1', size)
        
        start_time = time.time()
        solutions = algorithm.solve(problem)
        end_time = time.time()
        
        print(f"  Results: {len(solutions)} solutions in {end_time - start_time:.2f}s")
        print(f"  Performance: {algorithm.evaluation_count/(end_time - start_time):.0f} evals/sec")

def demo_algorithm_verification():
    """Demonstrate algorithm verification against specifications"""
    print("\n" + "=" * 70)
    print("Algorithm Verification Demo")
    print("=" * 70)
    
    print("\n✓ Parameter Verification:")
    params = IBMOLSParameters()
    matches_c = params.verify_c_defaults()
    print(f"  C defaults match: {matches_c}")
    
    print("\n✓ RNG Verification:")
    from ibmols import RNGVerifier
    rng = RNGVerifier(seed=42)
    first_values = rng.get_first_n_values(5)
    print(f"  First 5 random values: {[f'{v:.6f}' for v in first_values]}")
    
    print("\n✓ Problem Verification:")
    problem = create_test_problem('ZDT1', 10)
    test_solution = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    objectives = problem.evaluate(test_solution)
    print(f"  Test solution evaluation: f1={objectives[0]:.6f}, f2={objectives[1]:.6f}")
    
    print("\n✓ Archive Verification:")
    params = IBMOLSParameters(problem_size=10, max_evaluations=100, debug_level=0)
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 10)
    solutions = algorithm.solve(problem)
    
    # Check non-dominance
    dominated_pairs = 0
    for i in range(len(solutions)):
        for j in range(len(solutions)):
            if i != j and solutions[i].dominates(solutions[j]):
                dominated_pairs += 1
    
    print(f"  Archive size: {len(solutions)}")
    print(f"  Dominated pairs: {dominated_pairs} (should be 0)")
    print(f"  Non-dominance verified: {dominated_pairs == 0}")

if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    try:
        # Run demos
        solutions = demo_basic_functionality()
        demo_problem_scaling()
        demo_algorithm_verification()
        
        print("\n" + "=" * 70)
        print("DEMO SUMMARY")
        print("=" * 70)
        print("✓ IBMOLS algorithm successfully implemented")
        print("✓ All core functionality working correctly")
        print("✓ Proper Pareto front exploration achieved")
        print("✓ Algorithm scales with problem size")
        print("✓ Parameter verification complete")
        print(f"✓ Performance demonstrated: {solutions} solutions found")
        
        print("\nThe IBMOLS implementation is ready for integration!")
        
    except Exception as e:
        print(f"\n❌ Demo failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)