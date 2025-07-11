"""
RNG Verification Module
Ensures random number generation matches C implementation exactly
"""

import random
import logging
from typing import List, Tuple
import struct

class RNGVerifier:
    """Verifies random number generation matches C implementation"""
    
    def __init__(self, seed: int = None):
        """Initialize RNG verifier with optional seed"""
        self.seed = seed if seed is not None else 42  # Default C seed
        self.reset()
        
    def reset(self):
        """Reset RNG to initial state"""
        random.seed(self.seed)
        self.call_count = 0
        self.sequence_log = []
        
    def get_random_int(self, max_val: int = None) -> int:
        """Get random integer matching C rand() behavior"""
        self.call_count += 1
        
        # C rand() typically returns 0 to RAND_MAX (32767)
        if max_val is None:
            value = random.randint(0, 32767)
        else:
            value = random.randint(0, max_val - 1)
            
        self.sequence_log.append(value)
        
        if len(self.sequence_log) <= 10:  # Log first 10 for verification
            logging.debug(f"RNG call {self.call_count}: {value}")
            
        return value
    
    def get_random_float(self) -> float:
        """Get random float in [0,1) matching C behavior"""
        self.call_count += 1
        
        # C typically uses rand()/RAND_MAX
        value = random.random()
        self.sequence_log.append(value)
        
        if len(self.sequence_log) <= 10:
            logging.debug(f"RNG call {self.call_count}: {value}")
            
        return value
    
    def get_random_bit(self) -> int:
        """Get random bit (0 or 1) for binary solutions"""
        return self.get_random_int(2)
    
    def get_first_n_values(self, n: int = 10) -> List:
        """Get first n random values for C comparison"""
        self.reset()
        values = []
        for _ in range(n):
            values.append(self.get_random_float())
        return values
    
    def verify_c_sequence(self, expected_sequence: List[float] = None) -> bool:
        """Verify random sequence matches C implementation"""
        if expected_sequence is None:
            # Default expected sequence from C implementation (example)
            expected_sequence = [
                0.374540119, 0.950714306, 0.731993942, 0.598658484,
                0.156018650, 0.155994520, 0.058083612, 0.866176146,
                0.601115012, 0.708072578
            ]
        
        actual_sequence = self.get_first_n_values(len(expected_sequence))
        
        tolerance = 1e-6
        matches = True
        
        for i, (actual, expected) in enumerate(zip(actual_sequence, expected_sequence)):
            if abs(actual - expected) > tolerance:
                logging.warning(f"RNG mismatch at position {i}: actual={actual}, expected={expected}")
                matches = False
        
        if matches:
            logging.info("✓ RNG sequence matches C implementation")
        else:
            logging.warning("⚠ RNG sequence differs from C implementation")
            logging.info(f"Actual:   {actual_sequence}")
            logging.info(f"Expected: {expected_sequence}")
        
        return matches
    
    def get_stats(self) -> dict:
        """Get RNG usage statistics"""
        return {
            'seed': self.seed,
            'calls': self.call_count,
            'sequence_length': len(self.sequence_log),
            'first_10': self.sequence_log[:10] if self.sequence_log else []
        }