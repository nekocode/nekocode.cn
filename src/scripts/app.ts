import * as PIXI from "pixi.js";
import { sound } from "@pixi/sound";
import ifvisible from "ifvisible";
import { TiledMap } from "./tiled";
import { Game } from "./objects/Game";

const rootElement: HTMLElement =
  document.querySelector("#game") ?? document.body;
const loadingElement = rootElement.querySelector("#loading")!;
const app = new PIXI.Application<HTMLCanvasElement>({
  resizeTo: rootElement,
});

// Set pixi settings
PIXI.settings.ROUND_PIXELS = true;
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
// Add parser middleware of tiled map json file
PIXI.Assets.resolver;
PIXI.extensions.add(TiledMap.loaderParser);

// Load assets
(async () => {
  // Maps
  PIXI.Assets.add("texOverworld", "assets/maps/overworld.png");
  PIXI.Assets.add("mapMain", "assets/maps/main.tiled.json");
  // Preload textures
  PIXI.Assets.add("texMe", "assets/images/me_sprite.png");
  PIXI.Assets.add("texCursor", "assets/images/cursor.png");
  // Shaders
  PIXI.Assets.add("shaderSepia", "assets/shaders/sepia.frag.txt");
  PIXI.Assets.add(
    "shaderBrightnessContrast",
    "assets/shaders/brightness_contrast.frag.txt"
  );
  PIXI.Assets.add("shaderVignette", "assets/shaders/vignette.frag.txt");
  PIXI.Assets.add("shaderNoise", "assets/shaders/noise.frag.txt");
  // Sounds
  PIXI.Assets.add("bgm", "assets/sounds/bgm.mp3");

  // Load common assets
  const assets = await PIXI.Assets.load(
    [
      "texOverworld",
      "mapMain",
      "texMe",
      "texCursor",
      "shaderSepia",
      "shaderBrightnessContrast",
      "shaderVignette",
      "shaderNoise",
    ],
    (progress) => {
      loadingElement.innerHTML = "Loading " + progress.toFixed(0) + "%...";
    }
  );

  // Load some big resource files on a separate async loader
  PIXI.Assets.load(["bgm"]).then(() => {
    // Play background music
    let volumeAll = 1.0;
    ifvisible.on("blur", function () {
      volumeAll = 0.0;
    });
    ifvisible.on("focus", function () {
      volumeAll = 1.0;
    });
    setInterval(() => {
      if (sound.volumeAll < volumeAll) {
        const v = sound.volumeAll + 0.05;
        sound.volumeAll = Math.min(v, 1.0);
      } else if (sound.volumeAll > volumeAll) {
        const v = sound.volumeAll - 0.05;
        sound.volumeAll = Math.max(v, 0.0);
      }
    }, 100);
    sound.volumeAll = 1.0;
    try {
      sound.play("bgm", { loop: true });
    } catch {}
  });

  // Remove loading text
  loadingElement.remove();
  rootElement.appendChild(app.view);

  // Add filters
  app.stage.filters = [
    new PIXI.Filter(undefined, assets.shaderSepia, {
      amount: 0.9,
    }),
    new PIXI.Filter(undefined, assets.shaderBrightnessContrast, {
      brightness: -0.1,
      contrast: 0.1,
    }),
    new PIXI.Filter(undefined, assets.shaderVignette, {
      size: 0,
      amount: 1,
    }),
    new PIXI.Filter(undefined, assets.shaderNoise, {
      amount: 0.1,
    }),
  ];

  // Set stage scale
  const updateScale = () => {
    const maxWh = Math.max(app.screen.width, app.screen.height);
    app.stage.scale.set(maxWh / (11 * 32));
  };
  updateScale();
  window.onresize = updateScale;

  // Start game controlling
  new Game(app, assets.mapMain);

  // Resume application update
  app.start();
})();
