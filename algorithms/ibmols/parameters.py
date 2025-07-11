"""
IBMOLS Parameters and Configuration
Exact parameter matching with original C implementation
"""

import logging
from dataclasses import dataclass
from typing import Optional

@dataclass
class IBMOLSParameters:
    """Parameters for IBMOLS algorithm matching C implementation exactly"""
    
    # Core algorithm parameters - EXACT C DEFAULTS
    alpha: int = 10          # α parameter for local search intensity
    l_param: int = 5         # L parameter for neighborhood size 
    nbl: int = 100          # NBL parameter for non-dominated border limit
    frequency: int = 200     # FREQUENCY parameter for archive update frequency
    
    # Problem-specific parameters
    problem_size: int = 250  # Problem dimension (n)
    objectives: int = 2      # Number of objectives (m)
    
    # Termination criteria
    max_evaluations: int = 50000  # Maximum function evaluations
    
    # RNG parameters for verification
    rng_seed: Optional[int] = None  # Random seed for reproducibility
    verify_rng: bool = True         # Enable RNG verification against C
    
    # Debugging parameters  
    debug_level: int = 1     # 0=None, 1=Basic, 2=Detailed, 3=Verbose
    log_frequency: int = 100 # Log every N evaluations
    track_convergence: bool = True  # Track convergence patterns
    
    def __post_init__(self):
        """Validate parameters and log configuration"""
        self._validate_parameters()
        self._log_configuration()
    
    def _validate_parameters(self):
        """Validate parameter values match C implementation constraints"""
        if self.alpha <= 0:
            raise ValueError(f"alpha must be positive, got {self.alpha}")
        if self.l_param <= 0:
            raise ValueError(f"l_param must be positive, got {self.l_param}")
        if self.nbl <= 0:
            raise ValueError(f"nbl must be positive, got {self.nbl}")
        if self.frequency <= 0:
            raise ValueError(f"frequency must be positive, got {self.frequency}")
        if self.problem_size <= 0:
            raise ValueError(f"problem_size must be positive, got {self.problem_size}")
        if self.objectives <= 0:
            raise ValueError(f"objectives must be positive, got {self.objectives}")
        if self.max_evaluations <= 0:
            raise ValueError(f"max_evaluations must be positive, got {self.max_evaluations}")
    
    def _log_configuration(self):
        """Log parameter configuration for verification"""
        if self.debug_level > 0:
            logging.info("IBMOLS Parameters Configuration:")
            logging.info(f"  Core parameters: α={self.alpha}, L={self.l_param}, NBL={self.nbl}, FREQ={self.frequency}")
            logging.info(f"  Problem: {self.problem_size}×{self.objectives}")
            logging.info(f"  Max evaluations: {self.max_evaluations}")
            logging.info(f"  RNG seed: {self.rng_seed}")
            logging.info(f"  Debug level: {self.debug_level}")
    
    def verify_c_defaults(self) -> bool:
        """Verify parameters match C implementation defaults exactly"""
        c_defaults = {
            'alpha': 10,
            'l_param': 5, 
            'nbl': 100,
            'frequency': 200
        }
        
        matches = True
        for param, expected in c_defaults.items():
            actual = getattr(self, param)
            if actual != expected:
                logging.warning(f"Parameter {param}={actual} differs from C default {expected}")
                matches = False
        
        if matches:
            logging.info("✓ All core parameters match C implementation defaults")
        else:
            logging.warning("⚠ Some parameters differ from C implementation defaults")
            
        return matches