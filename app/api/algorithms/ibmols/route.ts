import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { seed = 12345, maxTime = 60 } = await request.json()
    
    // Path to the Python algorithm
    const algorithmPath = path.join(process.cwd(), 'algorithms', 'ibmols', 'simple_ibmols.py')
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [algorithmPath], {
        env: {
          ...process.env,
          PYTHONPATH: path.join(process.cwd(), 'algorithms')
        }
      })
      
      let output = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          // Parse output to extract results
          const lines = output.split('\n')
          const archiveLine = lines.find(line => line.includes('Final archive size:'))
          const solutionCount = archiveLine ? 
            parseInt(archiveLine.match(/(\d+) Pareto solutions/)?.[1] || '0') : 0
          
          resolve(NextResponse.json({
            success: true,
            solutionCount,
            output,
            message: `IBMOLS algorithm completed. Found ${solutionCount} Pareto solutions.`
          }))
        } else {
          resolve(NextResponse.json({
            success: false,
            error: error || 'Algorithm execution failed',
            output
          }, { status: 500 }))
        }
      })
      
      // Set timeout
      setTimeout(() => {
        pythonProcess.kill()
        resolve(NextResponse.json({
          success: false,
          error: 'Algorithm execution timed out',
          output
        }, { status: 408 }))
      }, (maxTime + 10) * 1000) // Add 10 seconds buffer
    })
    
  } catch (error) {
    console.error('IBMOLS API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}