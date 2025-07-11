"""
Debugging and Monitoring Module
Comprehensive debugging system for tracking algorithm behavior
"""

import logging
import time
from typing import List, Dict, Any
from dataclasses import dataclass
import json

@dataclass
class IterationStats:
    """Statistics for a single iteration"""
    iteration: int
    evaluations: int
    archive_size: int
    new_solutions: int
    dominated_removed: int
    local_search_calls: int
    time_elapsed: float

class IBMOLSDebugger:
    """Comprehensive debugging system for IBMOLS algorithm"""
    
    def __init__(self, debug_level: int = 1, log_frequency: int = 100):
        """Initialize debugger with specified level and frequency"""
        self.debug_level = debug_level
        self.log_frequency = log_frequency
        self.start_time = None
        self.iteration_stats = []
        self.archive_history = []
        self.convergence_data = []
        self.solution_counts = []
        
        # Setup logging
        self._setup_logging()
        
    def _setup_logging(self):
        """Setup logging configuration"""
        level = logging.INFO if self.debug_level > 0 else logging.WARNING
        if self.debug_level >= 3:
            level = logging.DEBUG
            
        logging.basicConfig(
            level=level,
            format='%(asctime)s - IBMOLS - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    def start_run(self, parameters):
        """Start a new algorithm run"""
        self.start_time = time.time()
        self.iteration_stats.clear()
        self.archive_history.clear()
        self.convergence_data.clear()
        self.solution_counts.clear()
        
        if self.debug_level > 0:
            logging.info("=" * 60)
            logging.info("IBMOLS Algorithm Run Started")
            logging.info("=" * 60)
            logging.info(f"Problem size: {parameters.problem_size}×{parameters.objectives}")
            logging.info(f"Max evaluations: {parameters.max_evaluations}")
            logging.info(f"Core parameters: α={parameters.alpha}, L={parameters.l_param}, NBL={parameters.nbl}, FREQ={parameters.frequency}")
    
    def log_iteration(self, iteration: int, evaluations: int, archive_size: int, 
                     new_solutions: int = 0, dominated_removed: int = 0, 
                     local_search_calls: int = 0):
        """Log iteration statistics"""
        current_time = time.time()
        time_elapsed = current_time - self.start_time if self.start_time else 0
        
        stats = IterationStats(
            iteration=iteration,
            evaluations=evaluations,
            archive_size=archive_size,
            new_solutions=new_solutions,
            dominated_removed=dominated_removed,
            local_search_calls=local_search_calls,
            time_elapsed=time_elapsed
        )
        
        self.iteration_stats.append(stats)
        self.solution_counts.append(archive_size)
        
        # Log at specified frequency or debug level
        should_log = (
            self.debug_level >= 2 or 
            iteration % self.log_frequency == 0 or
            iteration == 1
        )
        
        if should_log:
            logging.info(f"Iter {iteration:4d}: Evals={evaluations:5d}, Archive={archive_size:4d}, "
                        f"New={new_solutions:3d}, Removed={dominated_removed:3d}, "
                        f"LS calls={local_search_calls:3d}, Time={time_elapsed:.2f}s")
    
    def log_archive_update(self, iteration: int, archive_size_before: int, 
                          archive_size_after: int, update_reason: str):
        """Log archive update event"""
        update_info = {
            'iteration': iteration,
            'size_before': archive_size_before,
            'size_after': archive_size_after,
            'reason': update_reason,
            'net_change': archive_size_after - archive_size_before
        }
        
        self.archive_history.append(update_info)
        
        if self.debug_level >= 2:
            logging.debug(f"Archive update: {archive_size_before} → {archive_size_after} ({update_reason})")
    
    def log_local_search(self, iteration: int, solution_improved: bool, 
                        evaluations_used: int):
        """Log local search event"""
        if self.debug_level >= 3:
            status = "improved" if solution_improved else "no improvement"
            logging.debug(f"Local search iter {iteration}: {status}, {evaluations_used} evals")
    
    def log_convergence_check(self, iteration: int, convergence_metric: float):
        """Log convergence checking"""
        self.convergence_data.append({
            'iteration': iteration,
            'metric': convergence_metric
        })
        
        if self.debug_level >= 3:
            logging.debug(f"Convergence metric at iter {iteration}: {convergence_metric:.6f}")
    
    def finish_run(self, final_archive_size: int, total_evaluations: int):
        """Finish algorithm run and log summary"""
        end_time = time.time()
        total_time = end_time - self.start_time if self.start_time else 0
        
        if self.debug_level > 0:
            logging.info("=" * 60)
            logging.info("IBMOLS Algorithm Run Completed")
            logging.info("=" * 60)
            logging.info(f"Final archive size: {final_archive_size}")
            logging.info(f"Total evaluations: {total_evaluations}")
            logging.info(f"Total runtime: {total_time:.2f} seconds")
            logging.info(f"Evaluations/second: {total_evaluations/total_time:.1f}")
            
            if self.iteration_stats:
                max_archive = max(stats.archive_size for stats in self.iteration_stats)
                avg_archive = sum(stats.archive_size for stats in self.iteration_stats) / len(self.iteration_stats)
                logging.info(f"Archive size - Max: {max_archive}, Avg: {avg_archive:.1f}")
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        if not self.iteration_stats:
            return {}
        
        total_time = self.iteration_stats[-1].time_elapsed if self.iteration_stats else 0
        final_archive_size = self.iteration_stats[-1].archive_size if self.iteration_stats else 0
        total_evaluations = self.iteration_stats[-1].evaluations if self.iteration_stats else 0
        
        return {
            'final_archive_size': final_archive_size,
            'total_evaluations': total_evaluations,
            'total_runtime': total_time,
            'evaluations_per_second': total_evaluations / total_time if total_time > 0 else 0,
            'max_archive_size': max(stats.archive_size for stats in self.iteration_stats),
            'avg_archive_size': sum(stats.archive_size for stats in self.iteration_stats) / len(self.iteration_stats),
            'total_iterations': len(self.iteration_stats),
            'archive_updates': len(self.archive_history),
            'solution_counts_over_time': self.solution_counts.copy(),
            'convergence_data': self.convergence_data.copy()
        }
    
    def export_debug_data(self, filename: str):
        """Export all debug data to JSON file"""
        debug_data = {
            'iteration_stats': [
                {
                    'iteration': stats.iteration,
                    'evaluations': stats.evaluations,
                    'archive_size': stats.archive_size,
                    'new_solutions': stats.new_solutions,
                    'dominated_removed': stats.dominated_removed,
                    'local_search_calls': stats.local_search_calls,
                    'time_elapsed': stats.time_elapsed
                }
                for stats in self.iteration_stats
            ],
            'archive_history': self.archive_history.copy(),
            'convergence_data': self.convergence_data.copy(),
            'solution_counts': self.solution_counts.copy(),
            'performance_summary': self.get_performance_summary()
        }
        
        with open(filename, 'w') as f:
            json.dump(debug_data, f, indent=2)
        
        logging.info(f"Debug data exported to {filename}")