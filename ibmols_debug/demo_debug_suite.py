#!/usr/bin/env python3
"""
IBMOLS Debug Suite Demonstration
===============================

This script demonstrates how the debug suite identifies the 500.2.txt issue
and provides a quick validation of the implementation.

Usage: python demo_debug_suite.py
"""

import os
import sys
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ibmols_debug import IBMOLSDebug, DebugConfig, DebugLevel


def demo_issue_identification():
    """Demonstrate how the debug suite identifies the 500.2.txt issue"""
    
    print("=" * 70)
    print("IBMOLS Debug Suite - Issue Identification Demo")
    print("=" * 70)
    print()
    
    # Configure debug settings
    config = DebugConfig(
        level=DebugLevel.BASIC,
        log_to_console=True,
        log_to_file=False,
        track_rng=True
    )
    
    datasets = [
        ("datasets/250.2.txt", "Working Dataset", 125),
        ("datasets/500.2.txt", "Problematic Dataset", 2033)
    ]
    
    results = []
    
    for dataset_file, description, expected_solutions in datasets:
        print(f"\n{description} Analysis")
        print("-" * 40)
        print(f"Dataset: {dataset_file}")
        print(f"Expected solutions: {expected_solutions}")
        
        if not os.path.exists(dataset_file):
            print(f"⚠ Dataset file not found: {dataset_file}")
            continue
        
        # Create IBMOLS instance
        ibmols = IBMOLSDebug(config)
        
        try:
            # Load problem
            start_time = time.time()
            problem = ibmols.load_problem(dataset_file)
            load_time = time.time() - start_time
            
            print(f"✓ Problem loaded: {problem.n_variables} variables, {problem.n_objectives} objectives")
            print(f"  Load time: {load_time:.4f}s")
            
            # Run algorithm with different configurations
            configs = [
                {"pop_size": 20, "max_gen": 5, "name": "Quick Test"},
                {"pop_size": 50, "max_gen": 10, "name": "Standard Test"}
            ]
            
            for test_config in configs:
                print(f"\n  {test_config['name']}:")
                print(f"    Population: {test_config['pop_size']}, Generations: {test_config['max_gen']}")
                
                run_start = time.time()
                solutions = ibmols.run_ibmols(
                    population_size=test_config['pop_size'],
                    max_generations=test_config['max_gen']
                )
                run_time = time.time() - run_start
                
                print(f"    Solutions found: {len(solutions)}")
                print(f"    Runtime: {run_time:.2f}s")
                print(f"    Solutions per second: {len(solutions) / run_time:.2f}")
                
                # Check for issue
                if len(solutions) == 2 and expected_solutions > 100:
                    print("    ⚠ ISSUE DETECTED: Only 2 solutions found!")
                    print("    This indicates the 500.2.txt problem")
                elif len(solutions) == expected_solutions:
                    print("    ✓ Expected number of solutions achieved")
                else:
                    print(f"    ⚠ Unexpected result: got {len(solutions)}, expected {expected_solutions}")
                
                results.append({
                    'dataset': dataset_file,
                    'description': description,
                    'expected': expected_solutions,
                    'actual': len(solutions),
                    'runtime': run_time,
                    'config': test_config
                })
        
        except Exception as e:
            print(f"✗ Error testing {dataset_file}: {e}")
            results.append({
                'dataset': dataset_file,
                'description': description,
                'error': str(e)
            })
    
    # Analysis Summary
    print("\n" + "=" * 70)
    print("ISSUE ANALYSIS SUMMARY")
    print("=" * 70)
    
    issues_found = []
    
    for result in results:
        if 'error' in result:
            issues_found.append(f"ERROR: {result['dataset']} - {result['error']}")
        elif 'actual' in result:
            actual = result['actual']
            expected = result['expected']
            
            if actual == 2 and expected > 100:
                issues_found.append(f"CRITICAL: {result['dataset']} produces only 2 solutions (expected {expected})")
            elif actual != expected:
                issues_found.append(f"WARNING: {result['dataset']} produces {actual} solutions (expected {expected})")
    
    if issues_found:
        print("\nIssues Identified:")
        for i, issue in enumerate(issues_found, 1):
            print(f"{i}. {issue}")
        
        if any("500.2.txt" in issue and "only 2 solutions" in issue for issue in issues_found):
            print("\n🎯 500.2.txt Issue Confirmed!")
            print("The problematic dataset consistently produces only 2 solutions.")
            print("This matches the reported issue description.")
    else:
        print("\n✅ No issues detected")
    
    # Recommendations
    print("\n" + "=" * 70)
    print("DEBUGGING RECOMMENDATIONS")
    print("=" * 70)
    
    recommendations = [
        "1. Use verbose logging to trace extractPtoArchive_exact() function",
        "2. Compare dominance checking behavior between datasets",
        "3. Monitor population diversity during evolution",
        "4. Check for premature convergence patterns",
        "5. Verify objective function evaluation accuracy",
        "6. Test with different random seeds for reproducibility",
        "7. Use the comprehensive debug suite: python run_debug_suite.py --all"
    ]
    
    for rec in recommendations:
        print(rec)
    
    print("\n" + "=" * 70)
    print("DEMO COMPLETE")
    print("=" * 70)
    print(f"For detailed analysis, run: python run_debug_suite.py --all")
    print(f"This will generate comprehensive HTML reports in the reports/ directory")


if __name__ == "__main__":
    demo_issue_identification()