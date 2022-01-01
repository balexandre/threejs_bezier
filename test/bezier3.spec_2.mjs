import { expect } from 'chai';
import * as THREE from 'three';

import { bezier3 } from '../bezier3.mjs';

const v1 = new THREE.Vector3(0, 3, 0);
const v2 = new THREE.Vector3(1, 2, 0);
const v3 = new THREE.Vector3(2, 1, 0);
const v4 = new THREE.Vector3(3, 0, 0);

describe('PARTE I - Implementação do algoritmo Bezier quadratico (diagonal)', () => {
	it('quando t = 0.000 ', () => {
		const result = bezier3(v1, v2, v3, v4, 0);
		const expected = { x: 0, y: 3, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
	it('quando t = 0.250 ', () => {
		const result = bezier3(v1, v2, v3, v4, 0.250);
		const expected = { x: 0.75, y: 2.25, z: 0 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
		expect(Math.fround(result.z)).to.deep.equal(expected.z);
	});
	it('quando t = 0.500 ', () => {
		const result = bezier3(v1, v2, v3, v4, 0.500);
		const expected = { x: 1.5, y: 1.5, z: 0 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
		expect(Math.fround(result.z)).to.deep.equal(expected.z);
	});
	it('quando t = 0.750 ', () => {
		const result = bezier3(v1, v2, v3, v4, 0.750);
		const expected = { x: 2.25, y: 0.75, z: 0 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
		expect(Math.fround(result.z)).to.deep.equal(expected.z);
	});
	it('quando t = 1.000 ', () => {
		const result = bezier3(v1, v2, v3, v4, 1);
		const expected = { x: 3, y: 0, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
});
