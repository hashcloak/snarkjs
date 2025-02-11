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
import { utils } from "ffjavascript";
const { unstringifyBigInts } = utils;

export default async function formatDataForSwayTest(_proof, _pub) {
  function formatG1Point(x, y) {
    return `G1Point{
      x: ${p256(x)}u256,
      y: ${p256(y)}u256
    }`;
  }

  function formatScalar(value) {
    return `${p256(value)}u256`;
  }

  const proof = unstringifyBigInts(_proof);
  const pub = unstringifyBigInts(_pub);

  let publicInputs = pub.map(value => `${p256(value)}u256`).join(", ");

  return `fn get_test_proof() -> Proof {
    let proof_A = ${formatG1Point(proof.A[0], proof.A[1])};
    let proof_B = ${formatG1Point(proof.B[0], proof.B[1])};
    let proof_C = ${formatG1Point(proof.C[0], proof.C[1])};
    let proof_Z = ${formatG1Point(proof.Z[0], proof.Z[1])};
    let proof_T1 = ${formatG1Point(proof.T1[0], proof.T1[1])};
    let proof_T2 = ${formatG1Point(proof.T2[0], proof.T2[1])};
    let proof_T3 = ${formatG1Point(proof.T3[0], proof.T3[1])};
    let proof_Wxi = ${formatG1Point(proof.Wxi[0], proof.Wxi[1])};
    let proof_Wxiw = ${formatG1Point(proof.Wxiw[0], proof.Wxiw[1])};

    // Scalar values
    let eval_a = ${formatScalar(proof.eval_a)};
    let eval_b = ${formatScalar(proof.eval_b)};
    let eval_c = ${formatScalar(proof.eval_c)};
    let eval_s1 = ${formatScalar(proof.eval_s1)};
    let eval_s2 = ${formatScalar(proof.eval_s2)};
    let eval_zw = ${formatScalar(proof.eval_zw)};

    let proof = Proof {
      proof_A: proof_A,
      proof_B: proof_B,
      proof_C: proof_C,
      proof_Z: proof_Z,
      proof_T1: proof_T1,
      proof_T2: proof_T2,
      proof_T3: proof_T3,
      proof_Wxi: proof_Wxi,
      proof_Wxiw: proof_Wxiw,
      eval_a: eval_a,
      eval_b: eval_b,
      eval_c: eval_c,
      eval_s1: eval_s1,
      eval_s2: eval_s2,
      eval_zw: eval_zw,
    };

    return proof;
  }

  #[test]
  fn test_verification() {
      let proof = get_test_proof();
      let publicInput: [u256; ${pub.length}] = [${publicInputs}];
      assert(proof.verify(publicInput));
  }`;
}

// **Fixed Function to Format Numbers as Hex**
function p256(n) {
  let nstr = n.toString(16);
  while (nstr.length < 64) nstr = "0" + nstr; // Ensure 64 characters
  return `0x${nstr}`; // **No quotes, returns proper hex**
}
