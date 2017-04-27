#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'logs', `${process.argv[2]}.log`);

const content = fs.readFileSync(file, 'utf8');

console.log(content);
