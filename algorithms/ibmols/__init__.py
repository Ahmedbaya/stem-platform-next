"""
IBMOLS Package

This package implements the Iterated Best Improvement Multi-Objective Local Search
algorithm for Multi-Objective Knapsack Problems (MOKP).

The implementation exactly replicates the C version behavior to achieve optimal
performance and Pareto solution counts.
"""

from .structures import MOKPInstance, Individual, Archive, Population, loadMOKP
from .crandom import CRandom, srand, rand, randint, randfloat
from .ibmols import IBMOLS, run_ibmols

__version__ = "1.0.0"
__author__ = "STEM Platform"

__all__ = [
    "MOKPInstance", "Individual", "Archive", "Population", "loadMOKP",
    "CRandom", "srand", "rand", "randint", "randfloat",
    "IBMOLS", "run_ibmols"
]