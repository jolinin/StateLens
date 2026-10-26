#!/usr/bin/env node
'use strict';
const fs=require('node:fs');const Snapshot=require('../dist/snapshot.js');
try{if(process.argv.length!==3)throw new Error('Usage: node tools/check-snapshot.cjs snapshot.json');const stat=fs.statSync(process.argv[2]);if(stat.size>Snapshot.MAX_BYTES)throw new Error('Snapshot exceeds 256 KB');const result=Snapshot.audit(fs.readFileSync(process.argv[2],'utf8'));process.stdout.write(JSON.stringify(result,null,2)+'\n');process.exitCode=result.exitCode;}catch(error){process.stderr.write('StateLens: '+error.message+'\n');process.exitCode=2;}
