"""
Test Problems Module
Standard multi-objective test problems for algorithm validation
"""

import numpy as np
from typing import List, Tuple
from abc import ABC, abstractmethod

class TestProblem(ABC):
    """Abstract base class for multi-objective test problems"""
    
    def __init__(self, dimension: int, objectives: int = 2):
        """Initialize test problem with given dimension and objectives"""
        self.dimension = dimension
        self.objectives = objectives
        self.evaluation_count = 0
    
    @abstractmethod
    def evaluate(self, solution: List[int]) -> List[float]:
        """Evaluate solution and return objective values"""
        pass
    
    def reset_evaluations(self):
        """Reset evaluation counter"""
        self.evaluation_count = 0
    
    def get_evaluation_count(self) -> int:
        """Get number of evaluations performed"""
        return self.evaluation_count

class ZDT1(TestProblem):
    """ZDT1 test problem - Classic bi-objective optimization problem"""
    
    def __init__(self, dimension: int = 30):
        """Initialize ZDT1 with given dimension"""
        super().__init__(dimension, 2)
    
    def evaluate(self, solution: List[int]) -> List[float]:
        """Evaluate ZDT1 objectives
        
        For binary solutions, convert to real values in [0,1]
        For larger binary strings, group bits to form real values
        f1(x) = x1
        f2(x) = g(x) * h(f1(x), g(x))
        where g(x) = 1 + 9 * sum(x2...xn) / (n-1)
        and h(f1, g) = 1 - sqrt(f1/g)
        """
        self.evaluation_count += 1
        
        # Convert binary solution to real values
        # For large dimensions, group bits to create more diverse real values
        if self.dimension <= 30:
            # Direct conversion for small problems
            x = np.array(solution, dtype=float)
        else:
            # For larger problems, create grouped values for better diversity
            x = []
            bits_per_var = max(1, self.dimension // 30)  # Group bits
            for i in range(0, self.dimension, bits_per_var):
                bit_group = solution[i:i+bits_per_var]
                if bit_group:
                    # Convert bit group to real value in [0,1]
                    decimal_val = sum(bit * (2 ** j) for j, bit in enumerate(reversed(bit_group)))
                    max_val = (2 ** len(bit_group)) - 1
                    real_val = decimal_val / max_val if max_val > 0 else 0.0
                    x.append(real_val)
            x = np.array(x)
        
        # Ensure we have at least one variable
        if len(x) == 0:
            x = np.array([0.0])
        
        # First objective (first variable)
        f1 = x[0]
        
        # Calculate g function
        if len(x) > 1:
            g = 1.0 + 9.0 * np.sum(x[1:]) / (len(x) - 1)
        else:
            g = 1.0
        
        # Calculate h function
        h = 1.0 - np.sqrt(f1 / g) if g > 0 else 1.0
        
        # Second objective
        f2 = g * h
        
        return [f1, f2]

class ZDT2(TestProblem):
    """ZDT2 test problem - Non-convex Pareto front"""
    
    def __init__(self, dimension: int = 30):
        """Initialize ZDT2 with given dimension"""
        super().__init__(dimension, 2)
    
    def evaluate(self, solution: List[int]) -> List[float]:
        """Evaluate ZDT2 objectives
        
        f1(x) = x1
        f2(x) = g(x) * h(f1(x), g(x))
        where g(x) = 1 + 9 * sum(x2...xn) / (n-1)
        and h(f1, g) = 1 - (f1/g)^2
        """
        self.evaluation_count += 1
        
        # Convert binary solution to real values in [0,1]
        x = np.array(solution, dtype=float)
        
        # First objective
        f1 = x[0]
        
        # Calculate g function
        if self.dimension > 1:
            g = 1.0 + 9.0 * np.sum(x[1:]) / (self.dimension - 1)
        else:
            g = 1.0
        
        # Calculate h function
        h = 1.0 - (f1 / g) ** 2 if g > 0 else 1.0
        
        # Second objective
        f2 = g * h
        
        return [f1, f2]

class ZDT3(TestProblem):
    """ZDT3 test problem - Disconnected Pareto front"""
    
    def __init__(self, dimension: int = 30):
        """Initialize ZDT3 with given dimension"""
        super().__init__(dimension, 2)
    
    def evaluate(self, solution: List[int]) -> List[float]:
        """Evaluate ZDT3 objectives
        
        f1(x) = x1
        f2(x) = g(x) * h(f1(x), g(x))
        where g(x) = 1 + 9 * sum(x2...xn) / (n-1)
        and h(f1, g) = 1 - sqrt(f1/g) - (f1/g) * sin(10*pi*f1)
        """
        self.evaluation_count += 1
        
        # Convert binary solution to real values in [0,1]
        x = np.array(solution, dtype=float)
        
        # First objective
        f1 = x[0]
        
        # Calculate g function
        if self.dimension > 1:
            g = 1.0 + 9.0 * np.sum(x[1:]) / (self.dimension - 1)
        else:
            g = 1.0
        
        # Calculate h function
        if g > 0:
            ratio = f1 / g
            h = 1.0 - np.sqrt(ratio) - ratio * np.sin(10.0 * np.pi * f1)
        else:
            h = 1.0
        
        # Second objective
        f2 = g * h
        
        return [f1, f2]

# Problem factory for easy instantiation
def create_test_problem(problem_name: str, dimension: int) -> TestProblem:
    """Create test problem instance by name"""
    problems = {
        'ZDT1': ZDT1,
        'ZDT2': ZDT2,
        'ZDT3': ZDT3
    }
    
    if problem_name not in problems:
        raise ValueError(f"Unknown problem '{problem_name}'. Available: {list(problems.keys())}")
    
    return problems[problem_name](dimension)