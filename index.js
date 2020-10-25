#! /usr/bin/env node

/**
 * Dependencies
 * @const inquirer generates questions
 * @const archiver rars files
 * @const writeJSONSync to modify package.json
 * @const cwd current working directory
 */
const inquirer = require('inquirer');
const archiver = require('./includes/archiver');
const {writeJSONSync} = require('fs-extra');
const cwd = require('process').cwd();

/**
 * Look for package.json
 */
let packageJSON = undefined;

try {
  packageJSON = require(`${cwd}/package.json`);
} catch (error) {
  packageJSON = {};
}

if (packageJSON.zipper != undefined) {
  archiver(packageJSON.zipper);
  return;
}

/**
 * @const inputFileName  Get input file name.
 */
const outputFileName = process.argv.slice(2)[0];

/**
 * Start Asking Questions
 * and process answers
 * customize rollup-js
 */
inquirer.prompt([
  {
    type: 'list',
    name: 'outputChoice',
    message: 'Select predefined output path: ',
    default: 'desktop',
    choices: [
      'desktop',
      'custom',
    ],
  },
  {
    type: 'input',
    name: 'customOutputPath',
    message: 'Enter the output file path: ',
    default: './',
    when: ({outputChoice}) => {
      return outputChoice === 'custom';
    },
  },
]).then(({outputChoice, customOutputPath}) => {
  /**
   * Setup package.json file.
   * Start archiving.
   */
  packageJSON.zipper = {
    outputFileName,
    outputChoice,
    customOutputPath,
    globs: {
      include: [
        "**",
      ],
      exclude: [
        "package.json",
        "package-lock.json",
        "node_modules/**",
      ]
    },
  };

  if (packageJSON.scripts === undefined) packageJSON.scripts = {};

  packageJSON.scripts.zipper = 'zipper',

  writeJSONSync('./package.json', packageJSON, {spaces: 2});

  archiver(packageJSON.zipper);
});
