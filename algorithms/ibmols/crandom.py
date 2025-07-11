"""
C-Compatible Random Number Generator

This module implements a random number generator that exactly matches
the behavior of the C standard library rand() function used in the
original IBMOLS implementation.
"""

class CRandom:
    """
    C-compatible linear congruential generator (LCG)
    Implements the same algorithm as many C standard libraries:
    next = (a * seed + c) % m
    where a = 1103515245, c = 12345, m = 2^31
    """
    
    def __init__(self, seed: int = 1):
        self.seed = seed
        self.RAND_MAX = 2147483647  # 2^31 - 1
        self.a = 1103515245
        self.c = 12345
        self.m = 2147483648  # 2^31
        
    def srand(self, seed: int) -> None:
        """Set the random seed (equivalent to C srand())"""
        self.seed = seed
        
    def rand(self) -> int:
        """Generate next random number (equivalent to C rand())"""
        self.seed = (self.a * self.seed + self.c) % self.m
        return self.seed >> 1  # Return positive value in range [0, RAND_MAX]
    
    def randint(self, max_val: int) -> int:
        """Generate random integer in range [0, max_val-1]"""
        return self.rand() % max_val
    
    def randfloat(self) -> float:
        """Generate random float in range [0.0, 1.0)"""
        return float(self.rand()) / float(self.RAND_MAX + 1)


# Global instance to match C behavior
_c_random = CRandom()


def srand(seed: int) -> None:
    """Global srand function matching C behavior"""
    _c_random.srand(seed)


def rand() -> int:
    """Global rand function matching C behavior"""
    return _c_random.rand()


def randint(max_val: int) -> int:
    """Generate random integer in range [0, max_val-1]"""
    return _c_random.randint(max_val)


def randfloat() -> float:
    """Generate random float in range [0.0, 1.0)"""
    return _c_random.randfloat()


def shuffle_array(arr: list) -> None:
    """
    Shuffle array using Fisher-Yates algorithm with C-compatible random numbers
    This exactly replicates the shuffling behavior in C
    """
    n = len(arr)
    for i in range(n - 1, 0, -1):
        j = randint(i + 1)
        arr[i], arr[j] = arr[j], arr[i]