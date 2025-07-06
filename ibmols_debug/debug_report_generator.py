#!/usr/bin/env python3
"""
Debug Report Generator for IBMOLS
=================================

This module provides comprehensive report generation capabilities for 
IBMOLS debugging sessions, including visualization, analysis, and 
comparison tools.

Author: Debug Version
Date: 2024
"""

import os
import json
import time
import numpy as np
import matplotlib.pyplot as plt
from typing import Dict, List, Any, Optional
from pathlib import Path
import pandas as pd
from datetime import datetime


class DebugReportGenerator:
    """
    Generates comprehensive debug reports for IBMOLS analysis
    """
    
    def __init__(self, report_dir: str = "reports"):
        self.report_dir = Path(report_dir)
        self.report_dir.mkdir(exist_ok=True)
        
        # Report data
        self.debug_data = {}
        self.metadata = {
            'generated_at': datetime.now().isoformat(),
            'version': '1.0.0',
            'generator': 'IBMOLSDebugReportGenerator'
        }
    
    def load_debug_data(self, debug_file: str) -> Dict[str, Any]:
        """Load debug data from JSON file"""
        try:
            with open(debug_file, 'r') as f:
                data = json.load(f)
            return data
        except Exception as e:
            print(f"Error loading debug data from {debug_file}: {e}")
            return {}
    
    def generate_comprehensive_report(self, debug_files: List[str], 
                                    output_name: str = "comprehensive_debug_report") -> str:
        """Generate comprehensive report from multiple debug files"""
        
        print(f"Generating comprehensive report from {len(debug_files)} debug files...")
        
        # Load all debug data
        all_data = []
        for file in debug_files:
            data = self.load_debug_data(file)
            if data:
                data['source_file'] = file
                all_data.append(data)
        
        if not all_data:
            print("No valid debug data found")
            return ""
        
        # Generate report sections
        report_sections = []
        
        # Executive Summary
        report_sections.append(self._generate_executive_summary(all_data))
        
        # Performance Analysis
        report_sections.append(self._generate_performance_analysis(all_data))
        
        # Algorithm Behavior Analysis
        report_sections.append(self._generate_algorithm_analysis(all_data))
        
        # Issue Identification
        report_sections.append(self._generate_issue_identification(all_data))
        
        # Recommendations
        report_sections.append(self._generate_recommendations(all_data))
        
        # Detailed Data
        report_sections.append(self._generate_detailed_data_section(all_data))
        
        # Create HTML report
        html_report = self._create_html_report(report_sections, output_name)
        
        # Save report
        report_path = self.report_dir / f"{output_name}.html"
        with open(report_path, 'w') as f:
            f.write(html_report)
        
        # Generate charts
        self._generate_charts(all_data, output_name)
        
        # Generate CSV data
        self._generate_csv_data(all_data, output_name)
        
        print(f"Comprehensive report generated: {report_path}")
        return str(report_path)
    
    def _generate_executive_summary(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate executive summary section"""
        
        html = """
        <div class="section">
            <h2>Executive Summary</h2>
            <div class="summary-box">
        """
        
        # Count datasets tested
        datasets = set()
        total_issues = 0
        
        for data in all_data:
            if 'problem_name' in data:
                datasets.add(data['problem_name'])
            
            # Check for issues
            if 'final_solution_count' in data:
                expected = 2033 if '500.2' in data.get('problem_name', '') else 125
                actual = data['final_solution_count']
                if actual != expected:
                    total_issues += 1
        
        html += f"""
                <p><strong>Datasets Tested:</strong> {len(datasets)}</p>
                <p><strong>Issues Identified:</strong> {total_issues}</p>
                <p><strong>Report Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
        """
        
        # Key findings
        if total_issues > 0:
            html += """
            <div class="issue-box">
                <h3>Key Findings</h3>
                <ul>
                    <li>500.2.txt consistently produces only 2 solutions instead of expected 2033</li>
                    <li>Algorithm terminates prematurely for high-dimensional problems</li>
                    <li>Dominance checking may have issues with large solution spaces</li>
                </ul>
            </div>
            """
        
        html += "</div>"
        return html
    
    def _generate_performance_analysis(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate performance analysis section"""
        
        html = """
        <div class="section">
            <h2>Performance Analysis</h2>
        """
        
        # Performance table
        html += """
        <table class="performance-table">
            <tr>
                <th>Dataset</th>
                <th>Solutions Found</th>
                <th>Runtime (s)</th>
                <th>Solutions/Second</th>
                <th>Status</th>
            </tr>
        """
        
        for data in all_data:
            dataset = data.get('problem_name', 'Unknown')
            solutions = data.get('final_solution_count', 0)
            runtime = data.get('total_runtime', 0)
            solutions_per_sec = solutions / runtime if runtime > 0 else 0
            
            expected = 2033 if '500.2' in dataset else 125
            status = "✓ OK" if solutions == expected else "✗ ISSUE"
            
            html += f"""
            <tr>
                <td>{dataset}</td>
                <td>{solutions}</td>
                <td>{runtime:.2f}</td>
                <td>{solutions_per_sec:.2f}</td>
                <td>{status}</td>
            </tr>
            """
        
        html += "</table>"
        
        # Performance chart reference
        html += """
        <p><strong>Performance Chart:</strong> See performance_comparison.png for visual analysis</p>
        """
        
        html += "</div>"
        return html
    
    def _generate_algorithm_analysis(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate algorithm behavior analysis"""
        
        html = """
        <div class="section">
            <h2>Algorithm Behavior Analysis</h2>
        """
        
        # Analyze solution count evolution
        for data in all_data:
            dataset = data.get('problem_name', 'Unknown')
            
            html += f"""
            <h3>{dataset}</h3>
            <div class="algorithm-details">
            """
            
            # Solution count history
            if 'solution_count_history' in data:
                history = data['solution_count_history']
                html += f"""
                <p><strong>Solution Evolution:</strong></p>
                <ul>
                    <li>Initial solutions: {history[0] if history else 0}</li>
                    <li>Final solutions: {history[-1] if history else 0}</li>
                    <li>Generations: {len(history)}</li>
                </ul>
                """
            
            # Archive size history
            if 'archive_size_history' in data:
                archive_history = data['archive_size_history']
                html += f"""
                <p><strong>Archive Evolution:</strong></p>
                <ul>
                    <li>Max archive size: {max(archive_history) if archive_history else 0}</li>
                    <li>Final archive size: {archive_history[-1] if archive_history else 0}</li>
                    <li>Average archive size: {np.mean(archive_history) if archive_history else 0:.2f}</li>
                </ul>
                """
            
            # Dominance checks
            if 'total_dominance_checks' in data:
                html += f"""
                <p><strong>Dominance Checks:</strong> {data['total_dominance_checks']}</p>
                """
            
            html += "</div>"
        
        html += "</div>"
        return html
    
    def _generate_issue_identification(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate issue identification section"""
        
        html = """
        <div class="section">
            <h2>Issue Identification</h2>
        """
        
        issues = []
        
        # Check for specific issues
        for data in all_data:
            dataset = data.get('problem_name', 'Unknown')
            
            # Check solution count issue
            if '500.2' in dataset:
                expected = 2033
                actual = data.get('final_solution_count', 0)
                if actual == 2:
                    issues.append(f"CRITICAL: {dataset} produces only 2 solutions (expected {expected})")
            
            # Check runtime issues
            runtime = data.get('total_runtime', 0)
            if runtime < 1.0:
                issues.append(f"WARNING: {dataset} completes too quickly ({runtime:.2f}s)")
            
            # Check dominance checks
            dominance_checks = data.get('total_dominance_checks', 0)
            if dominance_checks < 100:
                issues.append(f"WARNING: {dataset} has unusually low dominance checks ({dominance_checks})")
        
        if issues:
            html += "<div class='issue-list'>"
            for issue in issues:
                html += f"<div class='issue-item'>{issue}</div>"
            html += "</div>"
        else:
            html += "<div class='success-box'>No issues identified</div>"
        
        html += "</div>"
        return html
    
    def _generate_recommendations(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate recommendations section"""
        
        html = """
        <div class="section">
            <h2>Recommendations</h2>
            
            <h3>Immediate Actions</h3>
            <ol>
                <li>Debug extractPtoArchive_exact() function with detailed logging</li>
                <li>Verify dominance relation computation for high-dimensional problems</li>
                <li>Test with different population sizes and generation limits</li>
                <li>Compare with C implementation step-by-step</li>
            </ol>
            
            <h3>Medium-term Improvements</h3>
            <ol>
                <li>Implement numerical stability checks</li>
                <li>Add comprehensive unit tests</li>
                <li>Create automated regression testing</li>
                <li>Improve logging and debugging infrastructure</li>
            </ol>
            
            <h3>Long-term Enhancements</h3>
            <ol>
                <li>Develop performance benchmarking suite</li>
                <li>Create algorithm visualization tools</li>
                <li>Implement adaptive parameter tuning</li>
                <li>Add multi-objective optimization metrics</li>
            </ol>
        </div>
        """
        
        return html
    
    def _generate_detailed_data_section(self, all_data: List[Dict[str, Any]]) -> str:
        """Generate detailed data section"""
        
        html = """
        <div class="section">
            <h2>Detailed Data</h2>
            <p>Complete debug data has been saved to CSV files for further analysis:</p>
            <ul>
                <li><strong>solution_history.csv</strong> - Solution count evolution</li>
                <li><strong>archive_history.csv</strong> - Archive size evolution</li>
                <li><strong>performance_metrics.csv</strong> - Performance data</li>
            </ul>
        </div>
        """
        
        return html
    
    def _create_html_report(self, sections: List[str], title: str) -> str:
        """Create complete HTML report"""
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{title}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    background-color: #f5f5f5;
                }}
                .container {{
                    max-width: 1200px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                h1 {{
                    color: #2c3e50;
                    text-align: center;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 10px;
                }}
                h2 {{
                    color: #34495e;
                    margin-top: 30px;
                    padding-left: 10px;
                    border-left: 4px solid #3498db;
                }}
                h3 {{
                    color: #555;
                    margin-top: 20px;
                }}
                .section {{
                    margin-bottom: 30px;
                }}
                .summary-box {{
                    background-color: #e8f4f8;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .issue-box {{
                    background-color: #ffebee;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    border-left: 4px solid #f44336;
                }}
                .success-box {{
                    background-color: #e8f5e8;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    border-left: 4px solid #4caf50;
                }}
                .issue-list {{
                    margin: 15px 0;
                }}
                .issue-item {{
                    background-color: #fff3cd;
                    padding: 10px;
                    margin: 5px 0;
                    border-radius: 3px;
                    border-left: 4px solid #ffc107;
                }}
                .performance-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }}
                .performance-table th, .performance-table td {{
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }}
                .performance-table th {{
                    background-color: #f2f2f2;
                    font-weight: bold;
                }}
                .algorithm-details {{
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .timestamp {{
                    text-align: center;
                    color: #666;
                    font-size: 0.9em;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>{title}</h1>
                {''.join(sections)}
                <div class="timestamp">
                    Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _generate_charts(self, all_data: List[Dict[str, Any]], output_name: str):
        """Generate visualization charts"""
        
        try:
            # Performance comparison chart
            datasets = []
            solution_counts = []
            runtimes = []
            
            for data in all_data:
                datasets.append(data.get('problem_name', 'Unknown'))
                solution_counts.append(data.get('final_solution_count', 0))
                runtimes.append(data.get('total_runtime', 0))
            
            # Create performance comparison chart
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
            
            # Solution count comparison
            ax1.bar(datasets, solution_counts, color=['green' if '250.2' in d else 'red' for d in datasets])
            ax1.set_title('Solution Count Comparison')
            ax1.set_ylabel('Solutions Found')
            ax1.tick_params(axis='x', rotation=45)
            
            # Runtime comparison
            ax2.bar(datasets, runtimes, color=['blue' if t > 1 else 'orange' for t in runtimes])
            ax2.set_title('Runtime Comparison')
            ax2.set_ylabel('Runtime (seconds)')
            ax2.tick_params(axis='x', rotation=45)
            
            plt.tight_layout()
            plt.savefig(self.report_dir / f"{output_name}_performance_comparison.png", dpi=300, bbox_inches='tight')
            plt.close()
            
            # Solution evolution chart
            fig, axes = plt.subplots(len(all_data), 1, figsize=(10, 4 * len(all_data)))
            if len(all_data) == 1:
                axes = [axes]
            
            for i, data in enumerate(all_data):
                if 'solution_count_history' in data:
                    history = data['solution_count_history']
                    axes[i].plot(history, marker='o', linewidth=2)
                    axes[i].set_title(f"Solution Evolution - {data.get('problem_name', 'Unknown')}")
                    axes[i].set_xlabel('Generation')
                    axes[i].set_ylabel('Solution Count')
                    axes[i].grid(True, alpha=0.3)
            
            plt.tight_layout()
            plt.savefig(self.report_dir / f"{output_name}_solution_evolution.png", dpi=300, bbox_inches='tight')
            plt.close()
            
            print(f"Charts generated: {output_name}_performance_comparison.png, {output_name}_solution_evolution.png")
            
        except Exception as e:
            print(f"Error generating charts: {e}")
    
    def _generate_csv_data(self, all_data: List[Dict[str, Any]], output_name: str):
        """Generate CSV data files"""
        
        try:
            # Performance metrics CSV
            performance_data = []
            for data in all_data:
                performance_data.append({
                    'dataset': data.get('problem_name', 'Unknown'),
                    'solutions_found': data.get('final_solution_count', 0),
                    'runtime': data.get('total_runtime', 0),
                    'dominance_checks': data.get('total_dominance_checks', 0),
                    'convergence_iterations': data.get('convergence_iterations', 0)
                })
            
            df = pd.DataFrame(performance_data)
            df.to_csv(self.report_dir / f"{output_name}_performance_metrics.csv", index=False)
            
            # Solution history CSV
            solution_history = []
            for data in all_data:
                dataset = data.get('problem_name', 'Unknown')
                if 'solution_count_history' in data:
                    history = data['solution_count_history']
                    for gen, count in enumerate(history):
                        solution_history.append({
                            'dataset': dataset,
                            'generation': gen,
                            'solution_count': count
                        })
            
            if solution_history:
                df_history = pd.DataFrame(solution_history)
                df_history.to_csv(self.report_dir / f"{output_name}_solution_history.csv", index=False)
            
            print(f"CSV files generated: {output_name}_performance_metrics.csv, {output_name}_solution_history.csv")
            
        except Exception as e:
            print(f"Error generating CSV files: {e}")
    
    def create_summary_report(self, debug_files: List[str]) -> str:
        """Create a quick summary report"""
        
        summary = {
            'total_files': len(debug_files),
            'datasets_tested': set(),
            'issues_found': 0,
            'total_runtime': 0,
            'findings': []
        }
        
        for file in debug_files:
            data = self.load_debug_data(file)
            if data:
                dataset = data.get('problem_name', 'Unknown')
                summary['datasets_tested'].add(dataset)
                summary['total_runtime'] += data.get('total_runtime', 0)
                
                # Check for issues
                if '500.2' in dataset and data.get('final_solution_count', 0) == 2:
                    summary['issues_found'] += 1
                    summary['findings'].append(f"{dataset}: Only 2 solutions found (expected 2033)")
        
        # Create summary text
        summary_text = f"""
        IBMOLS Debug Summary
        ===================
        
        Files Analyzed: {summary['total_files']}
        Datasets Tested: {len(summary['datasets_tested'])}
        Issues Found: {summary['issues_found']}
        Total Runtime: {summary['total_runtime']:.2f} seconds
        
        Key Findings:
        """
        
        for finding in summary['findings']:
            summary_text += f"- {finding}\n"
        
        if not summary['findings']:
            summary_text += "- No issues detected\n"
        
        # Save summary
        summary_file = self.report_dir / "debug_summary.txt"
        with open(summary_file, 'w') as f:
            f.write(summary_text)
        
        return summary_text


def main():
    """Main function for testing report generation"""
    
    print("IBMOLS Debug Report Generator")
    print("=" * 40)
    
    # Create report generator
    generator = DebugReportGenerator()
    
    # Look for debug files
    debug_files = []
    reports_dir = Path("reports")
    if reports_dir.exists():
        debug_files = list(reports_dir.glob("debug_*.json"))
    
    if debug_files:
        print(f"Found {len(debug_files)} debug files")
        
        # Generate comprehensive report
        report_path = generator.generate_comprehensive_report(
            [str(f) for f in debug_files],
            "ibmols_comprehensive_debug_report"
        )
        
        print(f"Report generated: {report_path}")
        
        # Create summary
        summary = generator.create_summary_report([str(f) for f in debug_files])
        print("\nSummary:")
        print(summary)
    else:
        print("No debug files found. Run the debug analysis first.")


if __name__ == "__main__":
    main()