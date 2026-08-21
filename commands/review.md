---
description: Scan for new drone images with cars, move matches to cars/, and record their license plates
tools: Task
model: sonnet
---
Run image-reviewer over `images/` and `course-api/images/` in parallel — each scan is independent, so start both at once rather than one after the other. Each call reports back which images in its folder show a drone photo of a car.

Once both scans finish, pass every image identified as containing a car to droneimage-handler so it can move each one into the `cars/` folder. This step depends on the scan results, so it must wait for both parallel scans to complete before it starts.

Once droneimage-handler has finished moving files, run licenseplate-reviewer over the `cars/` folder to read each license plate and write the registration number into that image's metadata. This also depends on the previous step, since it needs the images to already be in `cars/`.

Report to the user which images were moved and what registration numbers were recorded.
