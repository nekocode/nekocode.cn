import { Application, Assets, extensions, Filter } from "pixi.js";
import { sound } from "@pixi/sound";
import ifvisible from "ifvisible";
import { TiledMap } from "./tiled";
import { Game } from "./objects/Game";
import { AbstractRenderer, TextureStyle, GlProgram } from "pixi.js";

const rootElement: HTMLElement =
  document.querySelector("#game") ?? document.body;
const loadingElement = rootElement.querySelector("#loading")!;

// Set pixi settings
AbstractRenderer.defaultOptions.roundPixels = true;
TextureStyle.defaultOptions.scaleMode = "nearest";
sound.volumeAll = 1.0;
sound.disableAutoPause = true;

// Add parser middleware of tiled map json file
extensions.add(TiledMap.loaderParser);

// Load assets
(async () => {
  const app = new Application();
  await app.init({
    resizeTo: rootElement,
  });

  // Maps
  Assets.add({ alias: "mapMain", src: "assets/maps/main.tiled.json" });
  // Preload textures
  Assets.add({ alias: "texMe", src: "assets/images/me_sprite.png" });
  Assets.add({ alias: "texCursor", src: "assets/images/cursor.png" });
  // Shaders
  Assets.add({
    alias: "shaderDefaultVert",
    src: "assets/shaders/default.vert.txt",
  });
  Assets.add({
    alias: "shaderSepia",
    src: "assets/shaders/sepia.frag.txt",
  });
  Assets.add({
    alias: "shaderBrightnessContrast",
    src: "assets/shaders/brightness_contrast.frag.txt",
  });
  Assets.add({
    alias: "shaderVignette",
    src: "assets/shaders/vignette.frag.txt",
  });
  Assets.add({
    alias: "shaderNoise",
    src: "assets/shaders/noise.frag.txt",
  });
  // Sounds
  Assets.add({ alias: "bgm", src: "assets/sounds/bgm.mp3" });

  // Load common assets
  const assets = await Assets.load(
    [
      "mapMain",
      "texMe",
      "texCursor",
      "shaderDefaultVert",
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
  Assets.load(["bgm"]).then(() => {
    // Play background music
    let targetVolume = 1.0;
    ifvisible.on("blur", function () {
      targetVolume = 0.0;
    });
    ifvisible.on("focus", function () {
      targetVolume = 1.0;
    });
    setInterval(() => {
      if (sound.volumeAll < targetVolume) {
        const v = sound.volumeAll + 0.05;
        sound.volumeAll = Math.min(v, 1.0);
      } else if (sound.volumeAll > targetVolume) {
        const v = sound.volumeAll - 0.05;
        sound.volumeAll = Math.max(v, 0.0);
      }
    }, 100);
    try {
      sound.play("bgm", { loop: true });
    } catch {}
  });

  // Remove loading text
  loadingElement.remove();
  rootElement.appendChild(app.canvas);

  // Add filters
  app.stage.filters = [
    new Filter({
      glProgram: new GlProgram({
        vertex: assets.shaderDefaultVert,
        fragment: assets.shaderSepia,
      }),
      resources: {
        uniforms: {
          amount: { value: 0.9, type: "f32" },
        },
      },
    }),
    new Filter({
      glProgram: new GlProgram({
        vertex: assets.shaderDefaultVert,
        fragment: assets.shaderBrightnessContrast,
      }),
      resources: {
        uniforms: {
          brightness: { value: -0.1, type: "f32" },
          contrast: { value: 0.1, type: "f32" },
        },
      },
    }),
    new Filter({
      glProgram: new GlProgram({
        vertex: assets.shaderDefaultVert,
        fragment: assets.shaderVignette,
      }),
      resources: {
        uniforms: {
          size: { value: 0, type: "f32" },
          amount: { value: 1, type: "f32" },
        },
      },
    }),
    new Filter({
      glProgram: new GlProgram({
        vertex: assets.shaderDefaultVert,
        fragment: assets.shaderNoise,
      }),
      resources: {
        uniforms: {
          amount: { value: 0.1, type: "f32" },
        },
      },
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
  new Game(app, assets.mapMain).start();
})();
