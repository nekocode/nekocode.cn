import * as PIXI from "pixi.js";

export class Dialog extends PIXI.Container {
  private bg = new PIXI.Graphics();

  public constructor(
    width: number,
    height: number,
    private title: string,
    private content: string
  ) {
    super();

    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);

    this.bg.beginFill(0xff000000);
    this.bg.drawRoundedRect(0, 0, width, height / 3, 10);
    this.bg.endFill();
    this.bg.alpha = 0.5;

    this.bg.y = (height / 3) * 2;
    this.addChild(this.bg);

    const pad = 10;

    const titleText = new PIXI.Text(
      this.title,
      new PIXI.TextStyle({
        fill: "#fff",
        fontSize: 16,
        wordWrap: true,
        wordWrapWidth: width / 2 - pad * 2,
      })
    );
    titleText.anchor.set(0, 1);
    titleText.x = pad;
    titleText.y = (height / 3) * 2 - pad;
    this.addChild(titleText);

    const contentText = new PIXI.Text(
      this.content,
      new PIXI.TextStyle({
        fill: "#fff",
        fontSize: 16,
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: width - pad * 2,
      })
    );
    contentText.x = pad;
    contentText.y = (height / 3) * 2 + pad;
    this.addChild(contentText);
  }

  public show(container: PIXI.Container): Promise<any> {
    container.addChild(this);
    return new Promise((resolve: (value?: any) => void) => {
      this.on("pointertap", (_: PIXI.interaction.InteractionEvent) => {
        // Remove self
        container.removeChild(this);
        resolve();
      });
    });
  }
}
