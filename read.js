#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'logs', `${process.argv[2]}.log`);

console.log(fs.readFileSync(file, 'utf8'));
