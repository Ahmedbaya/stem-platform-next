#!/usr/bin/env python3
"""
Test script to verify that the Unicode encoding fix works correctly.
"""

import os
import sys

# Add the algorithms directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'algorithms'))

from ibmols import IBMOLSOptimizer


def test_unicode_fix():
    """Test that the Unicode encoding fix works correctly."""
    print("Testing Unicode encoding fix...")
    
    # Create optimizer with the fixed implementation
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    
    # Add some test solutions
    optimizer.solutions = [
        [[0.1, 0.2], [0.3, 0.4]],
        [[0.5, 0.6], [0.7, 0.8]],
        [[0.9, 1.0], [1.1, 1.2]]
    ]
    
    # Try to save results with Unicode characters
    try:
        optimizer.save_enhanced_results("fixed_unicode_test.txt")
        print("✅ Successfully saved results with Unicode characters!")
        
        # Verify the file was created and contains the expected content
        filepath = os.path.join("results", "fixed_unicode_test.txt")
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                if "α=20" in content and "Enhanced Implementation" in content:
                    print("✅ File contains expected Unicode content!")
                    return True
                else:
                    print("❌ File missing expected Unicode content")
                    return False
        else:
            print("❌ Results file was not created")
            return False
            
    except UnicodeEncodeError as e:
        print(f"❌ Unicode encoding error still occurs: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def test_enhanced_ibmols_500x2():
    """Test the enhanced IBMOLS 500×2 scenario with Unicode fix."""
    print("\nTesting Enhanced IBMOLS 500×2 scenario...")
    
    # Create optimizer with enhanced parameters
    optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)
    
    # Run a smaller test (reduced iterations for quick testing)
    solutions = optimizer.optimize(problem_size=(500, 2), max_iterations=100)
    
    print(f"Found {len(solutions)} solutions in test run")
    
    # Try to save results
    try:
        optimizer.save_enhanced_results("enhanced_ibmols_500x2_test.txt")
        print("✅ Successfully saved enhanced IBMOLS results!")
        
        # Verify file content
        filepath = os.path.join("results", "enhanced_ibmols_500x2_test.txt")
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Check for key Unicode characters and parameters
                if all(char in content for char in ['α', 'Enhanced Implementation', 'L=8', 'NBL=150']):
                    print("✅ All Unicode characters and parameters saved correctly!")
                    return True
                else:
                    print("❌ Some expected content missing from file")
                    return False
        else:
            print("❌ Results file was not created")
            return False
            
    except Exception as e:
        print(f"❌ Error saving enhanced results: {e}")
        return False


def verify_file_content():
    """Display the content of the saved file to verify Unicode handling."""
    print("\nVerifying saved file content...")
    
    filepath = os.path.join("results", "fixed_unicode_test.txt")
    if os.path.exists(filepath):
        print(f"Content of {filepath}:")
        print("-" * 50)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            print(content[:500])  # Show first 500 characters
            if len(content) > 500:
                print("... (content truncated)")
        print("-" * 50)
        return True
    else:
        print("❌ File not found")
        return False


if __name__ == "__main__":
    print("Unicode Encoding Fix Verification Test")
    print("=" * 50)
    
    # Test 1: Basic Unicode fix test
    test1_passed = test_unicode_fix()
    
    # Test 2: Enhanced IBMOLS scenario test
    test2_passed = test_enhanced_ibmols_500x2()
    
    # Test 3: Verify file content
    test3_passed = verify_file_content()
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print(f"✅ Basic Unicode fix test: {'PASSED' if test1_passed else 'FAILED'}")
    print(f"✅ Enhanced IBMOLS test: {'PASSED' if test2_passed else 'FAILED'}")
    print(f"✅ File content verification: {'PASSED' if test3_passed else 'FAILED'}")
    
    if all([test1_passed, test2_passed, test3_passed]):
        print("\n🎉 All tests passed! Unicode encoding fix is working correctly!")
        exit(0)
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        exit(1)