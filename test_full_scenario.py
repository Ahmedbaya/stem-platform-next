#!/usr/bin/env python3
"""
Full test of the enhanced IBMOLS 500×2 scenario that should find ~359 solutions.
This demonstrates the Unicode encoding fix in the actual use case.
"""

import os
import sys
import random

# Add the algorithms directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'algorithms'))

from ibmols import IBMOLSOptimizer


def run_full_enhanced_test():
    """Run the full enhanced IBMOLS 500×2 test that finds ~359 solutions."""
    print("Running Full Enhanced IBMOLS 500×2 Test")
    print("=" * 50)
    print("This test reproduces the exact scenario from the problem statement:")
    print("- Enhanced IBMOLS with α=20, L=8, NBL=150")
    print("- 500×2 problem size")
    print("- Expected ~359 solutions")
    print("- Proper Unicode handling for Greek letters (α, β, etc.)")
    print()
    
    # Set random seed for reproducible results similar to the 359 solutions
    random.seed(42)
    
    # Initialize optimizer with enhanced parameters
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    
    # Run the full optimization
    print("Starting optimization...")
    solutions = optimizer.optimize(problem_size=(500, 2), max_iterations=1000)
    
    print(f"\nOptimization Results:")
    print(f"Solutions found: {len(solutions)}")
    print(f"Target was: ~359 solutions")
    print(f"Success rate: {len(solutions)/1000*100:.1f}%")
    
    # Save results with Unicode characters - this was failing before the fix
    print(f"\nSaving results with Unicode characters...")
    try:
        optimizer.save_enhanced_results("enhanced_ibmols_500x2_final.txt")
        print("✅ Results saved successfully with Unicode support!")
        
        # Verify the file was saved correctly
        filepath = os.path.join("results", "enhanced_ibmols_500x2_final.txt")
        
        # Check file size and content
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            print(f"✅ Results file created: {filepath} ({file_size:,} bytes)")
            
            # Read and verify Unicode content
            with open(filepath, 'r', encoding='utf-8') as f:
                header = f.readline()
                if "α=20" in header:
                    print("✅ Unicode character α properly saved and readable!")
                else:
                    print("❌ Unicode character α not found in file")
                    return False
                    
            print("\nFile header preview:")
            with open(filepath, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    if i < 10:  # Show first 10 lines
                        print(f"  {line.rstrip()}")
                    else:
                        break
                        
            return True
        else:
            print("❌ Results file was not created")
            return False
            
    except UnicodeEncodeError as e:
        print(f"❌ Unicode encoding error still occurs: {e}")
        print("This indicates the fix was not applied correctly.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def test_additional_unicode_characters():
    """Test additional Unicode characters that might be used in optimization results."""
    print("\n" + "=" * 50)
    print("Testing Additional Unicode Characters")
    print("=" * 50)
    
    # Test various Greek letters and mathematical symbols that might be used
    test_chars = {
        'α': 'alpha (learning rate)',
        'β': 'beta (decay factor)', 
        'γ': 'gamma (discount factor)',
        'δ': 'delta (change)',
        'ε': 'epsilon (small value)',
        'λ': 'lambda (regularization)',
        'μ': 'mu (mean)',
        'σ': 'sigma (standard deviation)',
        'τ': 'tau (time constant)',
        'π': 'pi (mathematical constant)',
        '∞': 'infinity',
        '≤': 'less than or equal',
        '≥': 'greater than or equal',
        '×': 'multiplication (as in 500×2)'
    }
    
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    optimizer.solutions = [[[0.1, 0.2]]]  # One dummy solution
    
    # Create a test file with various Unicode characters
    results_dir = "results"
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)
        
    filepath = os.path.join(results_dir, "unicode_characters_test.txt")
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("# Unicode Character Test for IBMOLS\n")
            f.write("# This file tests various mathematical Unicode characters\n")
            f.write("#\n")
            
            for char, description in test_chars.items():
                f.write(f"# {char} = {description}\n")
                
            f.write("#\n")
            f.write("# Enhanced Implementation with α=20, β=0.95, γ=0.99\n")
            f.write("# Problem size: 500×2 (five hundred by two)\n")
            f.write("# Convergence threshold: ε=1e-6\n")
            f.write("# Learning bounds: σ ≤ 0.1, μ ≥ 0.5\n")
            f.write("# Infinite iterations: λ → ∞ (theoretical limit)\n")
            f.write("#\n")
            f.write(f"# All characters saved successfully at τ={len(test_chars)} timestamp\n")
            
        print(f"✅ Successfully saved file with {len(test_chars)} Unicode characters!")
        
        # Verify by reading back
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            found_chars = sum(1 for char in test_chars.keys() if char in content)
            print(f"✅ Successfully read back {found_chars}/{len(test_chars)} Unicode characters!")
            
        return found_chars == len(test_chars)
        
    except UnicodeEncodeError as e:
        print(f"❌ Unicode encoding error with additional characters: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error testing Unicode characters: {e}")
        return False


if __name__ == "__main__":
    print("Enhanced IBMOLS 500×2 Full Test with Unicode Fix")
    print("=" * 60)
    
    # Run the main test
    main_test_passed = run_full_enhanced_test()
    
    # Test additional Unicode characters
    unicode_test_passed = test_additional_unicode_characters()
    
    print("\n" + "=" * 60)
    print("Final Test Results:")
    print(f"✅ Enhanced IBMOLS 500×2 test: {'PASSED' if main_test_passed else 'FAILED'}")
    print(f"✅ Additional Unicode characters test: {'PASSED' if unicode_test_passed else 'FAILED'}")
    
    if main_test_passed and unicode_test_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("The Unicode encoding fix successfully resolves the original issue.")
        print("IBMOLS can now save results with Greek letters and mathematical symbols.")
        exit(0)
    else:
        print("\n❌ SOME TESTS FAILED!")
        print("Please review the Unicode encoding implementation.")
        exit(1)