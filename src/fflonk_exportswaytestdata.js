/*
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
import { utils } from "ffjavascript";

const { unstringifyBigInts } = utils;

function p256(n) {
    let nstr = n.toString(16);
    nstr = `0x${nstr}u256`;
    return nstr;
}

export default async function fflonkExportCallData(_proof, _pub) {
    const proof = unstringifyBigInts(_proof);
    const pub = unstringifyBigInts(_pub);

    const curve = await getCurveFromName(proof.curve);
    const G1 = curve.G1;
    const Fr = curve.Fr;

    let inputs = "";
    for (let i = 0; i < pub.length; i++) {
        if (inputs !== "") inputs = inputs + ",";
        inputs = inputs + p256(pub[i]);
    }

    let S = `#[test]
fn test_verification(){
    let proof = Proof{
        C1: G1Point {
            x: ${p256(proof.polynomials.C1[0])}, 
            y: ${p256(proof.polynomials.C1[1])},
        },
        C2: G1Point {
            x: ${p256(proof.polynomials.C2[0])},
            y: ${p256(proof.polynomials.C2[1])},
        },
        W: G1Point {
            x: ${p256(proof.polynomials.W1[0])},
            y: ${p256(proof.polynomials.W1[1])},
        },
        W_dash: G1Point {
            x: ${p256(proof.polynomials.W2[0])},
            y: ${p256(proof.polynomials.W2[1])},
        },
        q_L: Scalar{
            x: ${p256(proof.evaluations.ql)},
        },
        q_R: Scalar {
            x: ${p256(proof.evaluations.qr)},
        },
        q_M: Scalar {
            x: ${p256(proof.evaluations.qm)},
        },
        q_O: Scalar {
            x: ${p256(proof.evaluations.qo)},
        },
        q_C: Scalar {
            x: ${p256(proof.evaluations.qc)},
        },
        S_sigma_1: Scalar {
            x: ${p256(proof.evaluations.s1)},
        },
        S_sigma_2: Scalar {
            x: ${p256(proof.evaluations.s2)},
        },
        S_sigma_3: Scalar {
            x: ${p256(proof.evaluations.s3)},
        },
        a: Scalar {
            x: ${p256(proof.evaluations.a)},
        },
        b: Scalar {
            x: ${p256(proof.evaluations.b)},
        },
        c: Scalar {
            x: ${p256(proof.evaluations.c)},
        },
        z: Scalar {
            x: ${p256(proof.evaluations.z)},
        },
        z_omega: Scalar {
            x: ${p256(proof.evaluations.zw)},
        },
        T_1_omega: Scalar {
            x: ${p256(proof.evaluations.t1w)},
        },
        T_2_omega: Scalar {
            x: ${p256(proof.evaluations.t2w)},
        },
        batch_inv: Scalar {
            x: ${p256(proof.evaluations.inv)},
        },
    };
    let caller = abi(FflonkVerifier, CONTRACT_ID);
    let result = caller.verify(proof, [${inputs}]);
    assert(result)
}`
    return S
}