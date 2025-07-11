#!/usr/bin/env python3
"""
IBMOLS Algorithm Test Suite
Comprehensive tests to validate performance against C implementation
"""

import sys
import os
import logging
import time

# Add algorithms directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ibmols import IBMOLS, IBMOLSParameters, create_test_problem

def test_parameter_verification():
    """Test that parameters match C defaults exactly"""
    print("=" * 60)
    print("Testing Parameter Verification")
    print("=" * 60)
    
    params = IBMOLSParameters()
    
    # Verify C defaults
    assert params.alpha == 10, f"Alpha should be 10, got {params.alpha}"
    assert params.l_param == 5, f"L should be 5, got {params.l_param}"
    assert params.nbl == 100, f"NBL should be 100, got {params.nbl}"
    assert params.frequency == 200, f"FREQUENCY should be 200, got {params.frequency}"
    
    # Test verification function
    matches_c = params.verify_c_defaults()
    assert matches_c, "Parameters should match C defaults"
    
    print("✓ All parameter tests passed")
    return True

def test_rng_verification():
    """Test RNG verification against C implementation"""
    print("=" * 60)
    print("Testing RNG Verification")
    print("=" * 60)
    
    # Test with fixed seed
    params = IBMOLSParameters(rng_seed=42, verify_rng=True)
    algorithm = IBMOLS(params)
    
    # Get first 10 random values for comparison
    first_values = algorithm.rng.get_first_n_values(10)
    print(f"First 10 random values: {first_values}")
    
    # Test consistency
    algorithm.rng.reset()
    second_values = algorithm.rng.get_first_n_values(10)
    
    assert first_values == second_values, "RNG should be deterministic with same seed"
    
    print("✓ RNG verification tests passed")
    return True

def test_algorithm_basic():
    """Test basic algorithm functionality"""
    print("=" * 60)
    print("Testing Basic Algorithm Functionality")
    print("=" * 60)
    
    # Test with small problem
    params = IBMOLSParameters(
        problem_size=10,
        max_evaluations=1000,
        debug_level=2
    )
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 10)
    
    # Run algorithm
    start_time = time.time()
    solutions = algorithm.solve(problem)
    end_time = time.time()
    
    # Verify results
    assert len(solutions) > 0, "Algorithm should find at least one solution"
    assert algorithm.evaluation_count > 0, "Should perform evaluations"
    assert algorithm.iteration_count > 0, "Should perform iterations"
    
    print(f"✓ Found {len(solutions)} solutions")
    print(f"✓ Used {algorithm.evaluation_count} evaluations") 
    print(f"✓ Completed {algorithm.iteration_count} iterations")
    print(f"✓ Runtime: {end_time - start_time:.2f} seconds")
    
    return True

def test_performance_250x2():
    """Test performance on 250×2 problem - target ~1,385 solutions"""
    print("=" * 60)
    print("Testing 250×2 Problem Performance")
    print("=" * 60)
    
    params = IBMOLSParameters(
        problem_size=250,
        objectives=2,
        max_evaluations=100000,  # Increase evaluation budget
        debug_level=1,
        log_frequency=1000,
        nbl=5000,  # Increase NBL significantly
        frequency=100  # More frequent archive updates
    )
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 250)
    
    print("Running IBMOLS on 250×2 ZDT1 problem...")
    start_time = time.time()
    solutions = algorithm.solve(problem)
    end_time = time.time()
    
    solution_count = len(solutions)
    target_min = 1300  # 1385 - 5% tolerance
    target_max = 1470  # 1385 + 5% tolerance
    
    print(f"Solutions found: {solution_count}")
    print(f"Target range: {target_min} - {target_max}")
    print(f"Total evaluations: {algorithm.evaluation_count}")
    print(f"Runtime: {end_time - start_time:.2f} seconds")
    
    # Performance analysis
    stats = algorithm.get_statistics()
    print("\nPerformance Summary:")
    for key, value in stats['performance'].items():
        print(f"  {key}: {value}")
    
    # Check if we're within acceptable range
    if target_min <= solution_count <= target_max:
        print("✓ Performance within target range!")
        return True
    else:
        print(f"⚠ Performance outside target range: {solution_count} not in [{target_min}, {target_max}]")
        return False

def test_performance_500x2():
    """Test performance on 500×2 problem - target ~2,033 solutions"""
    print("=" * 60)
    print("Testing 500×2 Problem Performance")
    print("=" * 60)
    
    params = IBMOLSParameters(
        problem_size=500,
        objectives=2,
        max_evaluations=150000,  # Increase evaluation budget
        debug_level=1,
        log_frequency=1000,
        nbl=6000,  # Increase NBL significantly
        frequency=100  # More frequent archive updates
    )
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 500)
    
    print("Running IBMOLS on 500×2 ZDT1 problem...")
    start_time = time.time()
    solutions = algorithm.solve(problem)
    end_time = time.time()
    
    solution_count = len(solutions)
    target_min = 1930  # 2033 - 5% tolerance
    target_max = 2135  # 2033 + 5% tolerance
    
    print(f"Solutions found: {solution_count}")
    print(f"Target range: {target_min} - {target_max}")
    print(f"Total evaluations: {algorithm.evaluation_count}")
    print(f"Runtime: {end_time - start_time:.2f} seconds")
    
    # Performance analysis
    stats = algorithm.get_statistics()
    print("\nPerformance Summary:")
    for key, value in stats['performance'].items():
        print(f"  {key}: {value}")
    
    # Check if we're within acceptable range
    if target_min <= solution_count <= target_max:
        print("✓ Performance within target range!")
        return True
    else:
        print(f"⚠ Performance outside target range: {solution_count} not in [{target_min}, {target_max}]")
        return False

def test_performance_750x2():
    """Test performance on 750×2 problem - target ~3,306 solutions"""
    print("=" * 60)
    print("Testing 750×2 Problem Performance")
    print("=" * 60)
    
    params = IBMOLSParameters(
        problem_size=750,
        objectives=2,
        max_evaluations=200000,  # Increase evaluation budget significantly
        debug_level=1,
        log_frequency=1000,
        nbl=8000,  # Increase NBL significantly
        frequency=100  # More frequent archive updates
    )
    
    algorithm = IBMOLS(params)
    problem = create_test_problem('ZDT1', 750)
    
    print("Running IBMOLS on 750×2 ZDT1 problem...")
    start_time = time.time()
    solutions = algorithm.solve(problem)
    end_time = time.time()
    
    solution_count = len(solutions)
    target_min = 3140  # 3306 - 5% tolerance
    target_max = 3470  # 3306 + 5% tolerance
    
    print(f"Solutions found: {solution_count}")
    print(f"Target range: {target_min} - {target_max}")
    print(f"Total evaluations: {algorithm.evaluation_count}")
    print(f"Runtime: {end_time - start_time:.2f} seconds")
    
    # Performance analysis
    stats = algorithm.get_statistics()
    print("\nPerformance Summary:")
    for key, value in stats['performance'].items():
        print(f"  {key}: {value}")
    
    # Check if we're within acceptable range
    if target_min <= solution_count <= target_max:
        print("✓ Performance within target range!")
        return True
    else:
        print(f"⚠ Performance outside target range: {solution_count} not in [{target_min}, {target_max}]")
        return False

def run_comprehensive_tests():
    """Run all test cases"""
    print("IBMOLS Algorithm Test Suite")
    print("Testing complete fixed version implementation")
    print("=" * 60)
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    tests = [
        ("Parameter Verification", test_parameter_verification),
        ("RNG Verification", test_rng_verification),
        ("Basic Algorithm", test_algorithm_basic),
        ("250×2 Performance", test_performance_250x2),
        ("500×2 Performance", test_performance_500x2),
        ("750×2 Performance", test_performance_750x2),
    ]
    
    results = []
    total_start = time.time()
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result, "PASS" if result else "FAIL"))
        except Exception as e:
            print(f"✗ {test_name} failed with error: {e}")
            results.append((test_name, False, "ERROR"))
    
    total_end = time.time()
    
    # Print final results
    print("\n" + "=" * 60)
    print("FINAL TEST RESULTS")
    print("=" * 60)
    
    passed = 0
    for test_name, result, status in results:
        status_symbol = "✓" if result else "✗"
        print(f"{status_symbol} {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(tests)} tests passed")
    print(f"Total runtime: {total_end - total_start:.2f} seconds")
    
    if passed == len(tests):
        print("\n🎉 All tests passed! IBMOLS implementation is working correctly.")
        return True
    else:
        print(f"\n❌ {len(tests) - passed} tests failed. Implementation needs adjustment.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)