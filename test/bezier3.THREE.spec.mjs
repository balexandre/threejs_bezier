import { expect } from 'chai';
import * as THREE from 'three';

const v1 = new THREE.Vector3(0, 0, 0);
const v2 = new THREE.Vector3(0, 1, 0);
const v3 = new THREE.Vector3(0, 2, 0);
const v4 = new THREE.Vector3(0, 3, 0);

describe('PARTE I - algoritmo do ThreeJs (vertical)', () => {
	it('quando t = 0.000 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0);
		const expected = { x: 0, y: 0, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
	it('quando t = 0.250 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.250);
		const expected = { x: 0, y: 0.75, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
	it('quando t = 0.500 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.500);
		const expected = { x: 0, y: 1.5, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
	it('quando t = 0.750 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.750);
		const expected = { x: 0, y: 2.25, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
	it('quando t = 1.000 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(1);
		const expected = { x: 0, y: 3, z: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
		expect(result.z).to.deep.equal(expected.z);
	});
});
