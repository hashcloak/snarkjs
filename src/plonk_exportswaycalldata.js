/*
    Copyright 2021 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

import { getCurveFromName } from "./curves.js";
import {  utils }   from "ffjavascript";
const { unstringifyBigInts} = utils;

export default function plonkExportSwayCalldata(_proof, _pub) {
  const proof = _proof;
  const pub = _pub;

  let pubInputs = pub.map(v => `    bn("0x${BigInt(v).toString(16)}", "hex")`).join(',\n');

  const proofFields = [
      'A', 'B', 'C', 'Z', 'T1', 'T2', 'T3', 'Wxi', 'Wxiw'
  ].map(field => `    proof_${field}: {
      x: bn("0x${BigInt(proof[field][0]).toString(16)}", "hex"),
      y: bn("0x${BigInt(proof[field][1]).toString(16)}", "hex")
  }`).join(',\n');

  const scalarFields = [
      'eval_a', 'eval_b', 'eval_c', 'eval_s1', 'eval_s2', 'eval_zw'
  ].map(field => `    ${field}: bn("0x${BigInt(proof[field]).toString(16)}", "hex")`).join(',\n');

  // Code for index.ts
  return `
import {bn, Provider, Wallet} from "fuels";
import { SwayVerifierFactory } from "./fuels-out";

const main = async () => {
  const PROVIDER_URL = "http://127.0.0.1:4000/v1/graphql";
  const PRIVATE_KEY = "0xde97d8624a438121b86a1956544bd72ed68cd69f2c99555b08b1e8c51ffd511c";

  const provider = new Provider(PROVIDER_URL);
  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

  const factory = new SwayVerifierFactory(wallet);
  const { contract } = await (await factory.deploy()).waitForResult();

  // Construct Proof object
  const proof = {
${proofFields},
${scalarFields}
  };

  const pubInput = [
${pubInputs}
  ];

  const { waitForResult } = await contract.functions.verify(proof, pubInput).call();
  const { value } = await waitForResult();

  console.log("result is:", value);
};

main();
  `.trim();
}


