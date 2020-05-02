import * as PIXI from "pixi.js";

const PAD = 10;

export class Dialog extends PIXI.Container {
  private bg = new PIXI.Graphics();
  private titleText: PIXI.Text;
  private contentText: PIXI.Text;

  public constructor(
    private app: PIXI.Application,
    private title: string,
    private content: string
  ) {
    super();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg.beginFill(0xff000000);
    this.bg.drawRect(0, 0, 1, 1);
    this.bg.endFill();
    this.bg.alpha = 0.5;
    this.addChild(this.bg);

    this.titleText = new PIXI.Text(this.title);
    this.addChild(this.titleText);

    this.contentText = new PIXI.Text(this.content);
    this.addChild(this.contentText);

    this.update(width, height);
  }

  public show(container: PIXI.Container): Promise<any> {
    container.addChild(this);
    const tick = () => {
      this.update(this.getWidth(), this.getHeight());
    };
    this.app.ticker.add(tick);
    this.interactive = true;

    return new Promise((resolve: (value?: any) => void) => {
      this.on("pointertap", (_: PIXI.interaction.InteractionEvent) => {
        // Remove self
        this.app.ticker.remove(tick);
        container.removeChild(this);
        resolve();
      });
    });
  }

  private update(width: number, height: number) {
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);

    this.bg.width = width;
    this.bg.height = height / 3;
    this.bg.y = (height / 3) * 2;

    this.titleText.style = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16,
      wordWrap: true,
      wordWrapWidth: width / 2 - PAD * 2,
    });
    this.titleText.anchor.set(0, 1);
    this.titleText.x = PAD;
    this.titleText.y = (height / 3) * 2 - PAD;

    this.contentText.style = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16,
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: width - PAD * 2,
    });
    this.contentText.x = PAD;
    this.contentText.y = (height / 3) * 2 + PAD;
  }

  private getWidth() {
    return this.app.renderer.width / this.app.stage.scale.x;
  }

  private getHeight() {
    return this.app.renderer.height / this.app.stage.scale.y;
  }
}
