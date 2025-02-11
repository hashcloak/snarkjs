/*
    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/
import { utils } from "ffjavascript";
const { unstringifyBigInts } = utils;

function p256(n) {
    let nstr = n.toString(16);
    nstr = `0x${nstr}u256`;
    return nstr;
}

export default async function groth16ExportSwayCallData(_proof, _pub) {
    const proof = unstringifyBigInts(_proof);
    const pub = unstringifyBigInts(_pub);

    let inputs = "";
    for (let i = 0; i < pub.length; i++) {
        if (inputs != "") inputs = inputs + ",";
        inputs = inputs + p256(pub[i]);
    }

    let S;
    S = `#[test]
fn test_verification() {
    let p_a: [u256; 2] = [${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}];
    let p_b: [[u256; 2]; 2] = [[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(proof.pi_b[1][1])}, ${p256(proof.pi_b[1][0])}]];
    let p_c: [u256; 2] = [${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}];
    let pub_signals: [u256; ${pub.length}] = [${inputs}];
    let verifier = abi(Groth16Verifier, CONTRACT_ID);
    let r = verifier.verify_proof{}(p_a, p_b, p_c, pub_signals);
    assert(r)
}`

    return S;
}