import * as PIXI from "pixi.js";

const rootElement: HTMLElement =
  document.querySelector("#game") ?? document.body;
const app = new PIXI.Application({
  resizeTo: rootElement,
  autoDensity: true,
  resolution: devicePixelRatio,
});
rootElement.appendChild(app.view);

// Create background image
const background = PIXI.Sprite.from("assets/images/cat.png");
background.width = 400;
background.height = 400;
app.stage.addChild(background);

// Stop application wait for load to finish
app.stop();

app.loader
  .add("shaderSepia", "assets/shaders/sepia.frag")
  .add("shaderBulgePinch", "assets/shaders/bulgePinch.frag")
  .add("shaderBrightnessContrast", "assets/shaders/brightnessContrast.frag")
  .add("shaderVignette", "assets/shaders/vignette.frag")
  .add("shaderNoise", "assets/shaders/noise.frag")
  .load(onLoaded);

// Handle the load completed
function onLoaded(_: PIXI.Loader, res: any) {
  // Add filters
  background.filters = [
    new PIXI.Filter(undefined, res.shaderSepia.data, {
      amount: 0.9,
    }),
    new PIXI.Filter(undefined, res.shaderBulgePinch.data, {
      texSize: [app.screen.width, app.screen.height],
      center: [app.screen.width / 2.0, app.screen.height / 2.0],
      radius: (app.screen.width * 3.0) / 4.0,
      strength: 0.05,
    }),
    new PIXI.Filter(undefined, res.shaderBrightnessContrast.data, {
      brightness: -0.1,
      contrast: 0.1,
    }),
    new PIXI.Filter(undefined, res.shaderVignette.data, {
      size: 0,
      amount: 1,
    }),
    new PIXI.Filter(undefined, res.shaderNoise.data, {
      amount: 0.1,
    }),
  ];

  // Resume application update
  app.start();
}

// // Animate the filter
// app.ticker.add((delta) => {
//   filter.uniforms.customUniform += 0.04 * delta;
// });
