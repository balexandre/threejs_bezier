import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
// import * as THREE from 'three'

/**
 * @param  {THREE.Vector3} v1 vector #1
 * @param  {THREE.Vector3} v2 vector #2
 * @param  {THREE.Vector3} v3 vector #3
 * @param  {THREE.Vector3} v4 vector #4
 * @param  {float} t numero entre 0 e 1
 * @returns {THREE.Vector3} vector com a posicao no tempo "t"
 */
const bezier3 = (v1, v2, v3, v4, t) => {
	// Bezier formula
	// P = (1-t)³P1 + 3(1-t)²tP2 + 3(1-t)t²P3 + t³P4

	const k = 1 - t;
	const x = (k * k * k * v1.x) + (3 * k * k * t * v2.x) + (3 * k * t * t * v3.x) + (t * t * t * v4.x);
	const y = (k * k * k * v1.y) + (3 * k * k * t * v2.y) + (3 * k * t * t * v3.y) + (t * t * t * v4.y);
	const z = (k * k * k * v1.z) + (3 * k * k * t * v2.z) + (3 * k * t * t * v3.z) + (t * t * t * v4.z);

	return new THREE.Vector3(x, y, z);
}

export { bezier3 };
