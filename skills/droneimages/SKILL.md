---
name: carimages
description: Look droneimage files in the project's images folder in detail and if license plate recogniced then move to cars folder
---
# images
1. **What happens** --- use `mcp__filesystem__list_directory` to find image files (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`) in the project's `docs/` folder, then use the `Read` tool to view each image and write a short one-line description of what it shows
2. **Why** --- to give a quick visual inventory of the project's images without opening each one by hand
3. **How to test** --- every car image file in `images/` with license plate are moved to the cars folder
