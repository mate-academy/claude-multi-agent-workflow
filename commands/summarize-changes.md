Start parallel the code reviewer and test scanner sub-agents.  

Wait for them finishing their jobs and then summarize the changes on the current branch.
List each file that was touched, and give a one-line description of what changed in it. Keep the whole thing short enough to paste into a pull-request description.
If there are no changes in the tests files, report "No test changes". If the code-reviewer or the test-scanner sub-agent fails/times out, write a detailed report for that sub-agent instead of skipping it.
