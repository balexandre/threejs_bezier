import { expect } from 'chai';
import * as THREE from 'three';

const v1 = new THREE.Vector3(0, 3, 0);
const v2 = new THREE.Vector3(1, 2, 0);
const v3 = new THREE.Vector3(2, 1, 0);
const v4 = new THREE.Vector3(3, 0, 0);

describe('PARTE I - algoritmo do ThreeJs (diagonal)', () => {
	it('quando t = 0.000 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0);
		const expected = { x: 0, y: 3 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
	});
	it('quando t = 0.250 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.250);
		const expected = { x: 0.75, y: 2.25 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
	});
	it('quando t = 0.500 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.500);
		const expected = { x: 1.5, y: 1.5 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
	});
	it('quando t = 0.750 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(0.750);
		const expected = { x: 2.25, y: 0.75 };

		expect(Math.fround(result.x)).to.deep.equal(expected.x);
		expect(Math.fround(result.y)).to.deep.equal(expected.y);
	});
	it('quando t = 1.000 ', () => {
		const curve = new THREE.CubicBezierCurve3(v1, v2, v3, v4);
		const result = curve.getPointAt(1);
		const expected = { x: 3, y: 0 };

		expect(result.x).to.deep.equal(expected.x);
		expect(result.y).to.deep.equal(expected.y);
	});
});
