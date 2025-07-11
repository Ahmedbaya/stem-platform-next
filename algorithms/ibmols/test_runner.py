#!/usr/bin/env python3
"""
IBMOLS Test Runner

Test script to run the IBMOLS algorithm on the 250.2.txt instance
and validate performance against the C implementation target.
"""

import sys
import os
import time

# Add the algorithms directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols import run_ibmols


def main():
    """Run IBMOLS test and report results"""
    
    # Test configuration
    instance_file = os.path.join(os.path.dirname(__file__), '..', 'data', '250.2.txt')
    seed = 12345
    max_time = 300.0  # 5 minutes
    
    print("=" * 60)
    print("IBMOLS Algorithm Test")
    print("=" * 60)
    print(f"Instance file: {instance_file}")
    print(f"Random seed: {seed}")
    print(f"Maximum time: {max_time} seconds")
    print()
    
    if not os.path.exists(instance_file):
        print(f"ERROR: Instance file not found: {instance_file}")
        return 1
    
    try:
        # Run the algorithm
        start_time = time.time()
        solutions, num_solutions = run_ibmols(instance_file, seed, max_time)
        elapsed_time = time.time() - start_time
        
        print()
        print("=" * 60)
        print("RESULTS")
        print("=" * 60)
        print(f"Number of Pareto solutions found: {num_solutions}")
        print(f"Execution time: {elapsed_time:.2f} seconds")
        print()
        
        # Performance evaluation
        target_solutions = 1385  # C implementation target
        min_acceptable = 800     # Minimum acceptable performance
        
        print("Performance Evaluation:")
        print(f"Target (C implementation): {target_solutions} solutions")
        print(f"Minimum acceptable: {min_acceptable} solutions")
        print(f"Achieved: {num_solutions} solutions")
        
        if num_solutions >= target_solutions:
            print("✅ EXCELLENT: Matches or exceeds C implementation performance!")
        elif num_solutions >= min_acceptable:
            print("✅ GOOD: Acceptable performance achieved")
        else:
            print("❌ POOR: Performance below acceptable threshold")
        
        print()
        
        # Show first few Pareto solutions
        if solutions:
            print("Sample Pareto Solutions (first 10):")
            print("Objective 1\tObjective 2")
            print("-" * 30)
            for i, sol in enumerate(solutions[:10]):
                print(f"{sol.profit1:.2f}\t\t{sol.profit2:.2f}")
        
        # Save results
        results_file = os.path.join(os.path.dirname(__file__), 'test_results.txt')
        with open(results_file, 'w') as f:
            f.write(f"IBMOLS Test Results\n")
            f.write(f"Instance: {instance_file}\n")
            f.write(f"Seed: {seed}\n")
            f.write(f"Solutions found: {num_solutions}\n")
            f.write(f"Execution time: {elapsed_time:.2f}s\n")
            f.write(f"\nPareto Front:\n")
            f.write(f"Objective1\tObjective2\n")
            for sol in solutions:
                f.write(f"{sol.profit1:.6f}\t{sol.profit2:.6f}\n")
        
        print(f"Detailed results saved to: {results_file}")
        
        return 0 if num_solutions >= min_acceptable else 1
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())