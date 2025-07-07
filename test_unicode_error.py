#!/usr/bin/env python3
"""
Test script to reproduce the Unicode encoding error in IBMOLS results saving.
"""

import os
import sys

# Add the algorithms directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'algorithms'))

from ibmols import IBMOLSOptimizer


def test_unicode_error():
    """Test that reproduces the Unicode encoding error."""
    print("Testing Unicode encoding error reproduction...")
    
    # Create a simple optimizer instance
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    
    # Add some dummy solutions
    optimizer.solutions = [
        [[0.1, 0.2], [0.3, 0.4]],
        [[0.5, 0.6], [0.7, 0.8]]
    ]
    
    # Try to save results - this should trigger the Unicode error on Windows
    try:
        optimizer.save_enhanced_results("test_unicode_error.txt")
        print("❌ No Unicode error occurred - the test may not be running on Windows or with proper conditions")
        return False
    except UnicodeEncodeError as e:
        print(f"✅ Successfully reproduced Unicode encoding error: {e}")
        return True
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def test_with_simulated_windows_encoding():
    """Simulate Windows encoding behavior to reproduce the error."""
    print("\nTesting with simulated Windows encoding behavior...")
    
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    optimizer.solutions = [[[0.1, 0.2]]]
    
    # Simulate the error by trying to encode the string with 'charmap' codec
    test_string = "# Enhanced Implementation with α=20, L=8, NBL=150\n"
    
    try:
        # This simulates what happens on Windows with default encoding
        test_string.encode('charmap')
        print("❌ String encoded successfully with charmap - no error reproduced")
        return False
    except UnicodeEncodeError as e:
        print(f"✅ Successfully simulated Unicode encoding error: {e}")
        return True


if __name__ == "__main__":
    print("Unicode Encoding Error Reproduction Test")
    print("=" * 50)
    
    # Test 1: Try to reproduce with actual file writing
    test1_passed = test_unicode_error()
    
    # Test 2: Simulate Windows encoding behavior
    test2_passed = test_with_simulated_windows_encoding()
    
    if test1_passed or test2_passed:
        print("\n✅ Unicode encoding error successfully reproduced!")
        print("The error occurs because the Greek letter α cannot be encoded with 'charmap' codec on Windows.")
        exit(0)
    else:
        print("\n⚠️  Unicode encoding error could not be reproduced in this environment.")
        print("This might be because we're not on Windows or the system handles UTF-8 by default.")
        exit(0)