#!/usr/bin/env python3
"""
Debug 500.2.txt Issue - Specific Test Module
============================================

This module provides specific testing and debugging functionality for the
500.2.txt dataset that produces only 2 solutions instead of the expected 2033.

Author: Debug Version
Date: 2024
"""

import os
import sys
import time
import json
import numpy as np
from typing import List, Dict, Any
import matplotlib.pyplot as plt
from pathlib import Path

# Add the parent directory to the path to import ibmols_debug
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ibmols_debug import IBMOLSDebug, DebugConfig, DebugLevel, Solution


class Debug500Issue:
    """
    Specialized debugging class for the 500.2.txt issue
    """
    
    def __init__(self):
        self.working_dataset = "datasets/250.2.txt"
        self.problem_dataset = "datasets/500.2.txt"
        self.expected_solutions_500 = 2033
        self.expected_solutions_250 = 125  # Expected for comparison
        self.results = {}
        
    def run_comparative_analysis(self):
        """Run comparative analysis between working and problematic datasets"""
        print("=" * 60)
        print("500.2.txt Issue Debug Analysis")
        print("=" * 60)
        
        results = {}
        
        # Test 250.2.txt (working dataset)
        print("\n1. Testing 250.2.txt (Working Dataset)")
        print("-" * 40)
        
        if os.path.exists(self.working_dataset):
            results['250.2.txt'] = self._test_dataset(
                self.working_dataset, 
                "250.2.txt - Working Dataset",
                expected_solutions=self.expected_solutions_250
            )
        else:
            print(f"Warning: {self.working_dataset} not found")
            results['250.2.txt'] = None
        
        # Test 500.2.txt (problematic dataset)
        print("\n2. Testing 500.2.txt (Problematic Dataset)")
        print("-" * 40)
        
        if os.path.exists(self.problem_dataset):
            results['500.2.txt'] = self._test_dataset(
                self.problem_dataset,
                "500.2.txt - Problematic Dataset",
                expected_solutions=self.expected_solutions_500
            )
        else:
            print(f"Warning: {self.problem_dataset} not found")
            results['500.2.txt'] = None
        
        self.results = results
        
        # Generate comparative analysis
        self._generate_comparative_analysis()
        
        return results
    
    def _test_dataset(self, filename: str, description: str, expected_solutions: int) -> Dict[str, Any]:
        """Test a single dataset with comprehensive debugging"""
        
        print(f"\nTesting: {description}")
        print(f"File: {filename}")
        print(f"Expected solutions: {expected_solutions}")
        
        # Configure debug settings for detailed analysis
        config = DebugConfig(
            level=DebugLevel.DETAILED,
            log_to_console=True,
            log_to_file=True,
            track_rng=True,
            track_memory=True,
            validation_intermediate=True
        )
        
        # Create IBMOLS instance
        ibmols = IBMOLSDebug(config)
        
        try:
            # Load problem
            start_time = time.time()
            problem = ibmols.load_problem(filename)
            load_time = time.time() - start_time
            
            print(f"Problem loaded: {problem.n_variables} variables, {problem.n_objectives} objectives")
            print(f"Load time: {load_time:.4f}s")
            
            # Run algorithm with different configurations
            configs = [
                {"pop_size": 50, "max_gen": 20, "name": "small"},
                {"pop_size": 100, "max_gen": 30, "name": "medium"},
                {"pop_size": 200, "max_gen": 50, "name": "large"}
            ]
            
            config_results = []
            
            for config_params in configs:
                print(f"\nRunning {config_params['name']} configuration...")
                print(f"Population: {config_params['pop_size']}, Generations: {config_params['max_gen']}")
                
                run_start = time.time()
                solutions = ibmols.run_ibmols(
                    population_size=config_params['pop_size'],
                    max_generations=config_params['max_gen']
                )
                run_time = time.time() - run_start
                
                config_result = {
                    'config': config_params,
                    'solution_count': len(solutions),
                    'runtime': run_time,
                    'solutions': [{'variables': sol.variables.tolist(), 'objectives': sol.objectives.tolist()} 
                                for sol in solutions[:10]]  # Store first 10 solutions
                }
                
                config_results.append(config_result)
                
                print(f"Solutions found: {len(solutions)}")
                print(f"Runtime: {run_time:.2f}s")
                print(f"Solutions per second: {len(solutions) / run_time:.2f}")
                
                # Check if we got the expected number of solutions
                if len(solutions) == expected_solutions:
                    print("✓ Expected number of solutions achieved!")
                else:
                    print(f"✗ Expected {expected_solutions}, got {len(solutions)}")
                    if len(solutions) == 2 and expected_solutions == 2033:
                        print("⚠ This is the known 500.2.txt issue!")
            
            # Get debug summary
            debug_summary = ibmols.get_debug_summary()
            
            # Save detailed debug data
            timestamp = int(time.time())
            debug_filename = f"reports/debug_{os.path.basename(filename)}_{timestamp}.json"
            os.makedirs("reports", exist_ok=True)
            ibmols.save_debug_data(debug_filename)
            
            result = {
                'filename': filename,
                'description': description,
                'expected_solutions': expected_solutions,
                'problem_info': {
                    'n_variables': problem.n_variables,
                    'n_objectives': problem.n_objectives,
                    'load_time': load_time
                },
                'config_results': config_results,
                'debug_summary': debug_summary,
                'debug_file': debug_filename,
                'issue_detected': any(cr['solution_count'] != expected_solutions for cr in config_results)
            }
            
            return result
            
        except Exception as e:
            print(f"Error testing {filename}: {e}")
            return {
                'filename': filename,
                'description': description,
                'error': str(e),
                'issue_detected': True
            }
    
    def _generate_comparative_analysis(self):
        """Generate comparative analysis between working and problematic datasets"""
        print("\n" + "=" * 60)
        print("COMPARATIVE ANALYSIS")
        print("=" * 60)
        
        if not self.results.get('250.2.txt') or not self.results.get('500.2.txt'):
            print("Cannot perform comparative analysis - missing results")
            return
        
        result_250 = self.results['250.2.txt']
        result_500 = self.results['500.2.txt']
        
        print("\nDataset Comparison:")
        print(f"250.2.txt: {result_250['problem_info']['n_variables']} vars, {result_250['problem_info']['n_objectives']} objs")
        print(f"500.2.txt: {result_500['problem_info']['n_variables']} vars, {result_500['problem_info']['n_objectives']} objs")
        
        print("\nSolution Count Comparison:")
        for i, (config_250, config_500) in enumerate(zip(result_250['config_results'], result_500['config_results'])):
            config_name = config_250['config']['name']
            count_250 = config_250['solution_count']
            count_500 = config_500['solution_count']
            
            print(f"{config_name.capitalize()} Config:")
            print(f"  250.2.txt: {count_250} solutions")
            print(f"  500.2.txt: {count_500} solutions")
            
            if count_500 == 2:
                print("  ⚠ 500.2.txt shows the problematic behavior (only 2 solutions)")
        
        # Analyze debug data differences
        debug_250 = result_250['debug_summary']
        debug_500 = result_500['debug_summary']
        
        print("\nDebug Data Comparison:")
        print(f"Dominance checks - 250.2.txt: {debug_250['total_dominance_checks']}")
        print(f"Dominance checks - 500.2.txt: {debug_500['total_dominance_checks']}")
        
        print(f"Convergence iterations - 250.2.txt: {debug_250['convergence_iterations']}")
        print(f"Convergence iterations - 500.2.txt: {debug_500['convergence_iterations']}")
        
        # Potential issue identification
        print("\n" + "=" * 60)
        print("POTENTIAL ISSUE ANALYSIS")
        print("=" * 60)
        
        self._analyze_potential_issues(result_250, result_500)
        
        # Generate recommendations
        self._generate_recommendations()
    
    def _analyze_potential_issues(self, result_250: Dict, result_500: Dict):
        """Analyze potential issues causing the 500.2.txt problem"""
        
        print("\nPotential Issues Identified:")
        
        issues_found = []
        
        # Check if 500.2.txt consistently produces only 2 solutions
        solution_counts_500 = [cr['solution_count'] for cr in result_500['config_results']]
        if all(count == 2 for count in solution_counts_500):
            issues_found.append("CRITICAL: 500.2.txt consistently produces only 2 solutions across all configurations")
        
        # Check runtime differences
        avg_runtime_250 = np.mean([cr['runtime'] for cr in result_250['config_results']])
        avg_runtime_500 = np.mean([cr['runtime'] for cr in result_500['config_results']])
        
        if avg_runtime_500 < avg_runtime_250 * 0.5:
            issues_found.append("PERFORMANCE: 500.2.txt terminates too quickly, suggesting premature convergence")
        
        # Check dominance checks
        dominance_ratio = result_500['debug_summary']['total_dominance_checks'] / result_250['debug_summary']['total_dominance_checks']
        if dominance_ratio < 0.1:
            issues_found.append("DOMINANCE: Unusually low number of dominance checks in 500.2.txt")
        
        # Check convergence patterns
        conv_500 = result_500['debug_summary']['convergence_iterations']
        conv_250 = result_250['debug_summary']['convergence_iterations']
        
        if conv_500 < conv_250 * 0.2:
            issues_found.append("CONVERGENCE: 500.2.txt converges too rapidly")
        
        # Check problem structure
        if result_500['problem_info']['n_variables'] == 2 * result_250['problem_info']['n_variables']:
            issues_found.append("SCALING: Problem may have scaling issues with doubled variable count")
        
        # Display issues
        if issues_found:
            for i, issue in enumerate(issues_found, 1):
                print(f"{i}. {issue}")
        else:
            print("No obvious issues detected in comparison")
    
    def _generate_recommendations(self):
        """Generate debugging recommendations"""
        print("\n" + "=" * 60)
        print("DEBUGGING RECOMMENDATIONS")
        print("=" * 60)
        
        recommendations = [
            "1. Check extractPtoArchive_exact() function for dominance logic errors",
            "2. Verify objective function evaluation for 500-variable problems",
            "3. Examine population initialization for bias in 500.2.txt",
            "4. Test with different random seeds to check for deterministic issues",
            "5. Add breakpoints in dominance checking for manual inspection",
            "6. Compare C implementation behavior with Python implementation",
            "7. Check for numerical precision issues with larger problem sizes",
            "8. Verify that all 500 variables are properly utilized in objectives",
            "9. Test incremental problem sizes (300, 400, 500) to find threshold",
            "10. Add assertion checks for archive size changes during execution"
        ]
        
        for rec in recommendations:
            print(rec)
    
    def generate_debug_report(self, output_file: str = "reports/500_2obj_debug_report.html"):
        """Generate comprehensive HTML debug report"""
        print(f"\nGenerating debug report: {output_file}")
        
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        html_content = self._create_html_report()
        
        with open(output_file, 'w') as f:
            f.write(html_content)
        
        print(f"Debug report saved to: {output_file}")
    
    def _create_html_report(self) -> str:
        """Create HTML report content"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>500.2.txt Debug Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1, h2, h3 {{ color: #333; }}
                .issue {{ background-color: #ffebee; padding: 10px; border-left: 4px solid #f44336; }}
                .success {{ background-color: #e8f5e8; padding: 10px; border-left: 4px solid #4caf50; }}
                .warning {{ background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .code {{ background-color: #f4f4f4; padding: 10px; font-family: monospace; }}
            </style>
        </head>
        <body>
            <h1>500.2.txt Debug Report</h1>
            <p>Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h2>Executive Summary</h2>
            <div class="issue">
                <strong>Issue:</strong> 500.2.txt dataset produces only 2 solutions instead of expected 2033 solutions.
            </div>
            
            <h2>Test Results</h2>
            {self._generate_results_table()}
            
            <h2>Detailed Analysis</h2>
            {self._generate_analysis_section()}
            
            <h2>Recommendations</h2>
            {self._generate_recommendations_section()}
            
            <h2>Debug Data</h2>
            <p>Detailed debug data has been saved to individual JSON files for further analysis.</p>
            
        </body>
        </html>
        """
        return html
    
    def _generate_results_table(self) -> str:
        """Generate HTML table of results"""
        if not self.results:
            return "<p>No results available</p>"
        
        html = "<table><tr><th>Dataset</th><th>Variables</th><th>Objectives</th><th>Solutions Found</th><th>Expected</th><th>Status</th></tr>"
        
        for dataset, result in self.results.items():
            if result and 'problem_info' in result:
                vars_count = result['problem_info']['n_variables']
                objs_count = result['problem_info']['n_objectives']
                solutions_found = result['config_results'][-1]['solution_count'] if result['config_results'] else 0
                expected = result['expected_solutions']
                status = "✓ OK" if solutions_found == expected else "✗ ISSUE"
                
                html += f"<tr><td>{dataset}</td><td>{vars_count}</td><td>{objs_count}</td><td>{solutions_found}</td><td>{expected}</td><td>{status}</td></tr>"
        
        html += "</table>"
        return html
    
    def _generate_analysis_section(self) -> str:
        """Generate analysis section for HTML report"""
        return """
        <h3>Issue Analysis</h3>
        <p>The 500.2.txt dataset consistently produces only 2 solutions across different algorithm configurations, 
        suggesting a fundamental issue in the optimization process.</p>
        
        <h3>Potential Root Causes</h3>
        <ul>
            <li>Dominance relation computation errors for high-dimensional problems</li>
            <li>Premature convergence due to insufficient population diversity</li>
            <li>Numerical precision issues with 500-variable objective evaluations</li>
            <li>Archive management problems in extractPtoArchive_exact()</li>
        </ul>
        """
    
    def _generate_recommendations_section(self) -> str:
        """Generate recommendations section for HTML report"""
        return """
        <h3>Immediate Actions</h3>
        <ol>
            <li>Add detailed logging to extractPtoArchive_exact() function</li>
            <li>Implement step-by-step dominance checking verification</li>
            <li>Compare intermediate results with C implementation</li>
            <li>Test with reduced problem sizes to identify threshold</li>
        </ol>
        
        <h3>Long-term Improvements</h3>
        <ol>
            <li>Implement comprehensive unit tests for all algorithm components</li>
            <li>Add numerical stability checks for large-scale problems</li>
            <li>Create automated regression testing framework</li>
            <li>Develop performance benchmarking suite</li>
        </ol>
        """


def main():
    """Main function to run the 500.2.txt debug analysis"""
    print("Starting 500.2.txt Debug Analysis...")
    
    # Create debug instance
    debug = Debug500Issue()
    
    # Run comparative analysis
    results = debug.run_comparative_analysis()
    
    # Generate report
    debug.generate_debug_report()
    
    print("\n" + "=" * 60)
    print("DEBUG ANALYSIS COMPLETE")
    print("=" * 60)
    print("Check the reports/ directory for detailed debug files")
    print("Main report: reports/500_2obj_debug_report.html")


if __name__ == "__main__":
    main()