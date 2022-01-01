### Work with ThreeJs and cubic Bézier curves

a simple project with ThreeJs and the cubic [Bézier curve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)


### How does it work

- select the 4 points using the keyboard fomr <kbd>1</kbd> to <kbd>4</kbd>
- with a point (ball) selected, user the move to position it in the plan with <kbd>Space</kbd>
- one can move the selected point up and down the "z" axis with <kbd>W</kbd> and <kbd>S</kbd>
- to draw the cubic Bézier curve, press <kbd>X</kbd>
- <kbd>Backspace</kbd> will reset the plan

you can draw how many lines you want be keep changing the points and pressing <kbd>X</kbd>

![image](https://user-images.githubusercontent.com/45473/147861376-b9fc7c89-3c2a-4c80-bd84-abfcb5511172.png)

![image](https://user-images.githubusercontent.com/45473/147861386-97bbb91d-e122-4266-956f-e0909c7b141c.png)


### Unit tests

`bezier3.mjs` has unit tests so one can change it and make sure it does not change the result

run `npm test` in order to execute them

### How to run

as we use threeJs from a CDN, one needs to run the folder as a webserver, or you will get CORS error.
for that, run in the root folder `npx http-server` and navigate to http://localhost:8080 to see the web page
or `npm i`and then `npm run dev` aso [Vite](https://vitejs.dev/) can start the application on http://localhost:3000

## Live

the code is published as GitHub page and can be viewed on https://balexandre.github.io/threejs_bezier/
