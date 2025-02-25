#!/usr/bin/env node
/*

Copyright 2022 0KIMS association.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import fs from "fs";
import path from "path";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(__dirname + "/package.json"));
const version = pkg.version;


import WitnessCalculatorBuilder from "./js/witness_calculator.js";
import { utils } from "ffjavascript";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'



const argv = yargs(hideBin(process.argv))
    .version(version)
    .usage("calcwit -w [wasm file] -i [input file JSON] -o [output file .bin]")
    .alias("o", "output")
    .alias("i", "input")
    .alias("w", "wasm")
    .help("h")
    .alias("h", "help")
    .epilogue(`Copyright (C) 2018  0kims association
    This program comes with ABSOLUTELY NO WARRANTY;
    This is free software, and you are welcome to redistribute it
    under certain conditions; see the COPYING file in the official
    repo directory at  https://github.com/iden3/circom `)
    .argv;

const inputFileName = typeof(argv.input) === "string" ?  argv.input : "wtns.json";
const outputFileName = typeof(argv.output) === "string" ?  argv.output : "witness.bin";
const wasmFileName = typeof(argv.wasm) === "string" ?  argv.wasm : "circuit.wasm";


async function run() {


    const input = utils.unstringifyBigInts(JSON.parse(await fs.promises.readFile(inputFileName, "utf8")));
    const wasm = await fs.promises.readFile(wasmFileName);

    const wc = await WitnessCalculatorBuilder(wasm);

    const w = await wc.fromJSONtoWTNSBin(input);

    var wstream = fs.createWriteStream(outputFileName);

    wstream.write(Buffer.from(w));
    wstream.end();
    await new Promise(fulfill => wstream.on("finish", fulfill));
}


run();
