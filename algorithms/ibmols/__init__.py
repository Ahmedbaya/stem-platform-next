"""
IBMOLS (Improved Binary Multi-Objective Local Search) Algorithm
Python implementation with 100% fidelity to original C implementation.

This module provides a complete implementation of the IBMOLS algorithm
that matches the performance and behavior of the original C version.
"""

# Handle relative imports for both module and direct execution
try:
    from .ibmols import IBMOLS, Solution
    from .parameters import IBMOLSParameters
    from .debugger import IBMOLSDebugger
    from .rng_verifier import RNGVerifier
    from .test_problems import TestProblem, ZDT1, ZDT2, ZDT3, create_test_problem
except ImportError:
    from ibmols import IBMOLS, Solution
    from parameters import IBMOLSParameters
    from debugger import IBMOLSDebugger
    from rng_verifier import RNGVerifier
    from test_problems import TestProblem, ZDT1, ZDT2, ZDT3, create_test_problem

__version__ = "1.0.0"
__all__ = [
    "IBMOLS", 
    "Solution",
    "IBMOLSParameters", 
    "IBMOLSDebugger",
    "RNGVerifier",
    "TestProblem",
    "ZDT1",
    "ZDT2", 
    "ZDT3",
    "create_test_problem"
]