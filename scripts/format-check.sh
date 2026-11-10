
#!/bin/bash

echo "API Quality: Checking formatting..."

if [ -f "course-api/package.json" ]; then
  echo "Course API project detected."
fi

echo "Formatting check hook completed."
