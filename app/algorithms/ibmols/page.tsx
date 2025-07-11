"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function IBMOLSPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [seed, setSeed] = useState(12345)
  const [maxTime, setMaxTime] = useState(60)

  const runAlgorithm = async () => {
    setIsRunning(true)
    setResults(null)

    try {
      const response = await fetch('/api/algorithms/ibmols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seed, maxTime }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error running algorithm:', error)
      setResults({
        success: false,
        error: 'Failed to run algorithm'
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IBMOLS Algorithm</h1>
        <p className="text-muted-foreground">
          Iterated Best Improvement Multi-Objective Local Search for Multi-Objective Knapsack Problems
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Configuration</CardTitle>
            <CardDescription>
              Configure the IBMOLS algorithm parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seed">Random Seed</Label>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxTime">Max Time (seconds)</Label>
                <Input
                  id="maxTime"
                  type="number"
                  value={maxTime}
                  onChange={(e) => setMaxTime(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <Button 
              onClick={runAlgorithm} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Algorithm...' : 'Run IBMOLS Algorithm'}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Algorithm execution results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pareto Solutions Found</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {results.solutionCount}
                      </div>
                    </div>
                    <div>
                      <Label>Performance</Label>
                      <div className={`text-lg font-semibold ${
                        results.solutionCount >= 800 ? 'text-green-600' :
                        results.solutionCount >= 200 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {results.solutionCount >= 800 ? 'Excellent' :
                         results.solutionCount >= 200 ? 'Good' : 'Poor'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Algorithm Output</Label>
                    <Textarea
                      value={results.output}
                      readOnly
                      className="mt-2 h-40 font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-red-600 font-semibold">
                    Error: {results.error}
                  </div>
                  {results.output && (
                    <div>
                      <Label>Debug Output</Label>
                      <Textarea
                        value={results.output}
                        readOnly
                        className="mt-2 h-40 font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About IBMOLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                The IBMOLS (Iterated Best Improvement Multi-Objective Local Search) algorithm
                is designed to solve Multi-Objective Knapsack Problems (MOKP) effectively.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>C-compatible random number generation</li>
                    <li>Exact data loading from MOKP files</li>
                    <li>Local search with 1-exchange moves</li>
                    <li>Non-dominated archive management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Performance Targets:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Target: 800-1200+ Pareto solutions</li>
                    <li>C implementation: 1385 solutions</li>
                    <li>Test instance: 250 items, 2 objectives</li>
                    <li>Execution time: 60 seconds</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}