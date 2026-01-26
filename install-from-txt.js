#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const dependenciesFile = 'dependencies.txt';

if (!fs.existsSync(dependenciesFile)) {
  console.error(`Error: ${dependenciesFile} not found!`);
  process.exit(1);
}

const content = fs.readFileSync(dependenciesFile, 'utf-8');
const lines = content.split('\n');

let productionDeps = [];
let devDeps = [];
let isDevSection = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) {
    if (trimmed.includes('Development')) {
      isDevSection = true;
    }
    continue;
  }
  
  if (isDevSection) {
    devDeps.push(trimmed);
  } else {
    productionDeps.push(trimmed);
  }
}

console.log('Installing production dependencies...');
if (productionDeps.length > 0) {
  try {
    execSync(`npm install ${productionDeps.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error installing production dependencies:', error.message);
    process.exit(1);
  }
}

console.log('\nInstalling development dependencies...');
if (devDeps.length > 0) {
  try {
    execSync(`npm install --save-dev ${devDeps.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error installing development dependencies:', error.message);
    process.exit(1);
  }
}

console.log('\n✅ All dependencies installed successfully!');
