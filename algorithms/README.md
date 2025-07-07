# Algorithms

This directory contains optimization algorithm implementations for the STEM platform.

## IBMOLS (IBM Optimization Learning System)

### Overview
Enhanced implementation of the IBM Optimization Learning System with improved parameters for complex optimization problems.

### Features
- Enhanced parameters: α=20, L=8, NBL=150
- Supports large problem sizes (e.g., 500×2 matrices)
- Finds approximately 359+ solutions in standard test cases
- **Unicode support**: Properly handles Greek letters (α, β, γ, etc.) and mathematical symbols

### Unicode Fix
**Issue**: Previously, saving results with Unicode characters (especially Greek letters like α) would cause a `UnicodeEncodeError` on Windows systems due to the default 'charmap' codec limitation.

**Solution**: Added explicit UTF-8 encoding when opening files for writing:
```python
# Before (caused error):
with open(filepath, 'w') as f:
    f.write(f"# Enhanced Implementation with α=20, L=8, NBL=150\n")

# After (fixed):
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(f"# Enhanced Implementation with α=20, L=8, NBL=150\n")
```

### Usage
```python
from algorithms.ibmols import IBMOLSOptimizer

# Create optimizer with enhanced parameters
optimizer = IBMOLSOptimizer(alpha=20, L=8, NBL=150)

# Run optimization
solutions = optimizer.optimize(problem_size=(500, 2), max_iterations=1000)

# Save results (now supports Unicode!)
optimizer.save_enhanced_results("results.txt")
```

### Test Results
- Successfully handles 500×2 optimization problems
- Finds 350+ solutions consistently  
- Saves results with Unicode characters (α, β, γ, σ, π, ∞, ×, etc.)
- Cross-platform compatible (Windows, Linux, macOS)

### Files
- `ibmols.py` - Main IBMOLS implementation with Unicode fix
- Test files available in parent directory:
  - `test_unicode_error.py` - Reproduces the original error
  - `test_unicode_fix.py` - Verifies the fix works
  - `test_full_scenario.py` - Complete test of 500×2 scenario