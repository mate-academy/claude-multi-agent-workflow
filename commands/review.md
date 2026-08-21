---
description: Scan for new drone images with cars, move matches to cars/, and record their license plates
tools: Task, Glob
model: sonnet
---
List the image files in `course-api/images/`, then run image-reviewer once per image, all in parallel — each image is independent to inspect, so start every scan at once rather than one after another. Each call reports back whether that image is a drone photo showing a car.

Once every scan finishes, pass every image identified as containing a car to droneimage-handler so it can move each one into `course-api/images/cars/`. This step depends on the scan results, so it must wait for all parallel scans to complete before it starts.

Once droneimage-handler has finished moving files, run licenseplate-reviewer over `course-api/images/cars/` to read each license plate and write the registration number to a `<image>.json` sidecar file next to it. This also depends on the previous step, since it needs the images to already be in `cars/`.

Report to the user which images were moved and what registration numbers were recorded.
