name: quality-check
description: Runs a complete code quality workflow
body: |
  Run the following workflow:
  
  1. First, run the reviewer agent in parallel on:
     - API routes
     - Utility functions
  
  2. Then, based on the review findings, run the writer agent to:
     - Fix any critical issues found
     - Apply suggested improvements
  
  Return a summary of what was reviewed and what was fixed.
