# IBMOLS Debug Suite

This directory contains a comprehensive debugging implementation for the IBMOLS (IBM Online Learning System) algorithm, specifically designed to identify and fix the issue where the 500.2.txt dataset produces only 2 solutions instead of the expected 2033.

## Overview

The debug suite provides:
- Detailed logging and monitoring of algorithm execution
- Comparative analysis between working and problematic datasets
- Comprehensive report generation
- Step-by-step debugging of critical functions
- Performance metrics and visualization

## Files Structure

```
ibmols_debug/
├── ibmols_debug.py              # Main IBMOLS implementation with debug features
├── debug_500_2obj.py            # Specific test for 500.2.txt issue
├── debug_report_generator.py    # Report generation utilities
├── run_debug_suite.py           # Main execution script
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── datasets/                    # Test datasets
│   ├── 250.2.txt               # Working dataset (250 variables, 2 objectives)
│   └── 500.2.txt               # Problematic dataset (500 variables, 2 objectives)
├── logs/                       # Debug log files
├── reports/                    # Generated reports and debug data
└── charts/                     # Generated visualization charts
```

## Key Features

### 1. Debug Output System
- **Multiple verbosity levels**: NONE, BASIC, DETAILED, VERBOSE, ALL
- **Dual logging**: Console and file output with timestamps
- **Structured logging**: JSON format for analysis
- **Real-time monitoring**: Live solution count tracking

### 2. Critical Debug Points
- **extractPtoArchive_exact()**: Detailed dominance checking logs
- **Indicator_local_search1_exact()**: Convergence tracking
- **Population initialization**: Verification and validation
- **Archive management**: Size changes and content tracking
- **RNG state tracking**: For reproducibility

### 3. Comparative Analysis
- **Side-by-side comparison**: 250.2.txt vs 500.2.txt
- **Performance metrics**: Runtime, solutions/second, memory usage
- **Algorithm behavior**: Solution evolution, convergence patterns
- **Issue identification**: Automated problem detection

### 4. Report Generation
- **HTML reports**: Comprehensive analysis with visualizations
- **CSV data**: Raw data for external analysis
- **Performance charts**: Visual comparison of datasets
- **Executive summary**: Key findings and recommendations

## Quick Start

### Prerequisites
```bash
pip install -r requirements.txt
```

### Run Comprehensive Analysis
```bash
python run_debug_suite.py --all
```

### Test Specific Dataset
```bash
python run_debug_suite.py --dataset datasets/500.2.txt --verbose
```

### Generate Reports Only
```bash
python run_debug_suite.py --report-only
```

## Usage Examples

### 1. Basic Usage
```python
from ibmols_debug import IBMOLSDebug, DebugConfig, DebugLevel

# Configure debugging
config = DebugConfig(level=DebugLevel.DETAILED, log_to_file=True)

# Create instance and run
ibmols = IBMOLSDebug(config)
problem = ibmols.load_problem("datasets/500.2.txt")
solutions = ibmols.run_ibmols(population_size=100, max_generations=30)

print(f"Solutions found: {len(solutions)}")
```

### 2. Comparative Analysis
```python
from debug_500_2obj import Debug500Issue

# Run comparative analysis
debug = Debug500Issue()
results = debug.run_comparative_analysis()

# Generate report
debug.generate_debug_report()
```

### 3. Report Generation
```python
from debug_report_generator import DebugReportGenerator

# Generate comprehensive report
generator = DebugReportGenerator()
report_path = generator.generate_comprehensive_report(
    ["reports/debug_500.2.txt_123456.json"],
    "comprehensive_analysis"
)
```

## Debug Configuration

The `DebugConfig` class allows fine-tuning of debug behavior:

```python
config = DebugConfig(
    level=DebugLevel.VERBOSE,        # Verbosity level
    log_to_file=True,                # Save to log file
    log_to_console=True,             # Display in console
    log_dir="logs",                  # Log directory
    track_rng=True,                  # Track RNG state
    track_memory=True,               # Monitor memory usage
    validate_intermediate=True,      # Validate intermediate results
    comparison_mode=False            # Enable comparison mode
)
```

## Understanding the 500.2.txt Issue

### Problem Description
The 500.2.txt dataset consistently produces only 2 solutions instead of the expected 2033 across different algorithm configurations, indicating a fundamental issue in the optimization process.

### Potential Root Causes
1. **Dominance relation errors**: Issues with high-dimensional dominance checking
2. **Premature convergence**: Insufficient population diversity
3. **Numerical precision**: Problems with 500-variable objective evaluation
4. **Archive management**: Bugs in `extractPtoArchive_exact()` function
5. **Scaling issues**: Algorithm doesn't handle large problem sizes properly

### Debug Strategy
1. **Comparative analysis**: Compare with working 250.2.txt dataset
2. **Step-by-step debugging**: Trace execution through critical functions
3. **Intermediate validation**: Check solution quality at each step
4. **Performance profiling**: Identify bottlenecks and anomalies
5. **Statistical analysis**: Examine solution distribution patterns

## Generated Reports

### HTML Reports
- **500_2obj_debug_report.html**: Main analysis report
- **ibmols_comprehensive_debug_report.html**: Detailed technical report

### Data Files
- **debug_DATASET_TIMESTAMP.json**: Complete debug data
- **performance_metrics.csv**: Performance comparison data
- **solution_history.csv**: Solution evolution data

### Visualizations
- **performance_comparison.png**: Dataset performance comparison
- **solution_evolution.png**: Solution count evolution charts
- **archive_size_history.png**: Archive size progression

## Debugging Workflow

1. **Setup Environment**
   ```bash
   python run_debug_suite.py --help-extended
   ```

2. **Run Initial Analysis**
   ```bash
   python run_debug_suite.py --all
   ```

3. **Examine Results**
   - Check `reports/500_2obj_debug_report.html`
   - Review log files in `logs/`
   - Analyze CSV data in `reports/`

4. **Deep Debugging**
   - Enable verbose logging
   - Add custom debug points
   - Compare with C implementation
   - Test with reduced problem sizes

5. **Validation**
   - Verify fixes with test datasets
   - Run regression tests
   - Performance benchmarking

## Expected Output

### For 250.2.txt (Working Dataset)
```
Solutions found: 125
Runtime: 12.45s
Solutions per second: 10.04
Status: ✓ OK
```

### For 500.2.txt (Problematic Dataset)
```
Solutions found: 2
Runtime: 0.34s
Solutions per second: 5.88
Status: ✗ ISSUE - Expected 2033 solutions
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Dataset Files Not Found**
   - Ensure datasets are in the `datasets/` directory
   - Check file permissions and format

3. **Memory Issues**
   - Reduce population size for initial testing
   - Enable memory tracking in debug config

4. **Performance Problems**
   - Use smaller generation limits for testing
   - Enable performance profiling

### Debug Tips

1. **Start with verbose logging**: `--verbose` flag
2. **Use smaller test cases**: Reduce population/generations
3. **Compare with working dataset**: Always test both datasets
4. **Check intermediate results**: Enable validation
5. **Monitor resource usage**: Track memory and CPU

## Contributing

When making changes to the debug suite:

1. **Test thoroughly**: Use both 250.2.txt and 500.2.txt
2. **Update documentation**: Keep README current
3. **Add debug logging**: For new functions
4. **Validate results**: Against expected outputs
5. **Generate reports**: Document findings

## Integration with STEM Platform

This debug suite is designed to be integrated with the main STEM platform for:
- Competition algorithm debugging
- Performance optimization
- Educational demonstrations
- Research validation

The debug output can be used to:
- Improve algorithm implementations
- Validate competition results
- Generate educational content
- Support research publications

## License

This debug suite is part of the STEM Platform project and follows the same licensing terms.