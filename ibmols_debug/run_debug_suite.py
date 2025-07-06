#!/usr/bin/env python3
"""
IBMOLS Debug Suite - Main Runner
===============================

This script provides a unified interface to run all IBMOLS debugging tools
and generate comprehensive reports for the 500.2.txt issue.

Usage:
    python run_debug_suite.py [options]

Options:
    --dataset <file>     : Test specific dataset
    --all                : Run all available tests
    --report-only        : Generate report from existing debug files
    --verbose            : Enable verbose logging
    --help               : Show this help message

Author: Debug Version
Date: 2024
"""

import sys
import os
import argparse
from pathlib import Path

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ibmols_debug import IBMOLSDebug, DebugConfig, DebugLevel
from debug_500_2obj import Debug500Issue
from debug_report_generator import DebugReportGenerator


def setup_environment():
    """Setup the debug environment"""
    print("Setting up IBMOLS Debug Environment...")
    
    # Create necessary directories
    directories = ['logs', 'reports', 'datasets']
    for dir_name in directories:
        os.makedirs(dir_name, exist_ok=True)
        print(f"✓ Directory {dir_name} ready")
    
    # Check if datasets exist
    datasets = ['datasets/250.2.txt', 'datasets/500.2.txt']
    for dataset in datasets:
        if os.path.exists(dataset):
            print(f"✓ Dataset {dataset} found")
        else:
            print(f"⚠ Dataset {dataset} missing")
    
    print("Environment setup complete.\n")


def run_specific_dataset(dataset_file: str, verbose: bool = False):
    """Run debug analysis on a specific dataset"""
    print(f"Running debug analysis on {dataset_file}")
    
    if not os.path.exists(dataset_file):
        print(f"Error: Dataset file {dataset_file} not found")
        return
    
    # Configure debug settings
    debug_level = DebugLevel.VERBOSE if verbose else DebugLevel.DETAILED
    config = DebugConfig(
        level=debug_level,
        log_to_console=True,
        log_to_file=True,
        track_rng=True,
        track_memory=True,
        validate_intermediate=True
    )
    
    # Create IBMOLS instance
    ibmols = IBMOLSDebug(config)
    
    try:
        # Load and run
        problem = ibmols.load_problem(dataset_file)
        solutions = ibmols.run_ibmols(population_size=100, max_generations=30)
        
        print(f"Analysis complete:")
        print(f"  Solutions found: {len(solutions)}")
        print(f"  Problem: {problem.n_variables} variables, {problem.n_objectives} objectives")
        
        # Save debug data
        import time
        debug_file = f"reports/debug_{os.path.basename(dataset_file)}_{int(time.time())}.json"
        ibmols.save_debug_data(debug_file)
        print(f"  Debug data saved: {debug_file}")
        
    except Exception as e:
        print(f"Error running analysis: {e}")


def run_comprehensive_analysis():
    """Run comprehensive analysis comparing datasets"""
    print("Running comprehensive 500.2.txt issue analysis...")
    
    debug_analyzer = Debug500Issue()
    results = debug_analyzer.run_comparative_analysis()
    
    # Generate report
    debug_analyzer.generate_debug_report()
    
    print("\nComprehensive analysis complete.")
    print("Check reports/500_2obj_debug_report.html for detailed results.")


def generate_reports_only():
    """Generate reports from existing debug files"""
    print("Generating reports from existing debug files...")
    
    # Find all debug files
    debug_files = []
    reports_dir = Path("reports")
    if reports_dir.exists():
        debug_files = list(reports_dir.glob("debug_*.json"))
    
    if not debug_files:
        print("No debug files found. Run analysis first.")
        return
    
    print(f"Found {len(debug_files)} debug files")
    
    # Generate comprehensive report
    generator = DebugReportGenerator()
    report_path = generator.generate_comprehensive_report(
        [str(f) for f in debug_files],
        "ibmols_comprehensive_debug_report"
    )
    
    print(f"Comprehensive report generated: {report_path}")
    
    # Create summary
    summary = generator.create_summary_report([str(f) for f in debug_files])
    print("\nSummary:")
    print(summary)


def show_help():
    """Show help information"""
    help_text = """
    IBMOLS Debug Suite - Help
    ========================
    
    This suite provides comprehensive debugging tools for the IBMOLS algorithm,
    specifically designed to investigate the 500.2.txt issue where only 2 
    solutions are found instead of the expected 2033.
    
    Usage Examples:
    
    1. Run comprehensive analysis (recommended):
       python run_debug_suite.py --all
    
    2. Test specific dataset:
       python run_debug_suite.py --dataset datasets/500.2.txt
    
    3. Generate reports only:
       python run_debug_suite.py --report-only
    
    4. Verbose debugging:
       python run_debug_suite.py --dataset datasets/500.2.txt --verbose
    
    Files Generated:
    - logs/ibmols_debug_TIMESTAMP.log        : Detailed execution logs
    - reports/debug_DATASET_TIMESTAMP.json   : Debug data for analysis
    - reports/500_2obj_debug_report.html     : Comprehensive HTML report
    - reports/REPORT_performance_comparison.png : Performance charts
    
    Debug Features:
    - Detailed logging at each algorithm step
    - Solution count evolution tracking
    - Archive size monitoring
    - Dominance checking verification
    - Performance metrics collection
    - Comparative analysis between datasets
    
    For the 500.2.txt issue specifically:
    - Compares behavior with working 250.2.txt dataset
    - Identifies potential root causes
    - Provides actionable recommendations
    - Generates detailed debugging reports
    """
    print(help_text)


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="IBMOLS Debug Suite - Comprehensive debugging for optimization issues",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('--dataset', type=str, help='Test specific dataset file')
    parser.add_argument('--all', action='store_true', help='Run comprehensive analysis')
    parser.add_argument('--report-only', action='store_true', help='Generate reports only')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--help-extended', action='store_true', help='Show extended help')
    
    args = parser.parse_args()
    
    # Show extended help
    if args.help_extended:
        show_help()
        return
    
    # Setup environment
    setup_environment()
    
    # Execute based on arguments
    if args.report_only:
        generate_reports_only()
    elif args.dataset:
        run_specific_dataset(args.dataset, args.verbose)
    elif args.all:
        run_comprehensive_analysis()
    else:
        print("IBMOLS Debug Suite")
        print("=" * 40)
        print("Choose an option:")
        print("1. Run comprehensive analysis (recommended)")
        print("2. Test specific dataset")
        print("3. Generate reports only")
        print("4. Show help")
        print()
        
        choice = input("Enter choice (1-4): ").strip()
        
        if choice == '1':
            run_comprehensive_analysis()
        elif choice == '2':
            dataset = input("Enter dataset file path: ").strip()
            if dataset:
                run_specific_dataset(dataset)
        elif choice == '3':
            generate_reports_only()
        elif choice == '4':
            show_help()
        else:
            print("Invalid choice. Use --help for usage information.")


if __name__ == "__main__":
    main()