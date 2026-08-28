#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the version from course-api/package.json
let pkgVersion;
try {
  const pkgPath = path.join(process.cwd(), 'course-api', 'package.json');
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);
  pkgVersion = pkg.version;
} catch (e) {
  console.error('Warning: Could not read course-api/package.json:', e.message);
  process.exit(0); // Non-blocking
}

// Check if CHANGELOG.md exists and has an entry for this version
const changelogPath = path.join(process.cwd(), 'course-api', 'CHANGELOG.md');
let changelogExists = false;
let versionFoundInChangelog = false;

if (fs.existsSync(changelogPath)) {
  changelogExists = true;
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  // Look for a heading like "## [1.0.0]" or "## [1.0.0] - date"
  const versionRegex = new RegExp(`^## \\[${pkgVersion.replace(/\./g, '\\.')}\\]`, 'm');
  if (versionRegex.test(changelogContent)) {
    versionFoundInChangelog = true;
  }
}

// Warn if version in package.json doesn't match CHANGELOG.md
if (!changelogExists) {
  console.warn(`\n⚠️  Warning: course-api/CHANGELOG.md does not exist. Version "${pkgVersion}" will not be documented unless the changelog is created.`);
} else if (!versionFoundInChangelog) {
  console.warn(`\n⚠️  Warning: course-api/CHANGELOG.md does not have an entry for version "${pkgVersion}". Please add a "## [${pkgVersion}]" section to keep the changelog in sync.`);
}

// Exit 0 (success, non-blocking)
process.exit(0);
