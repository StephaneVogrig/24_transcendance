export class InputManager {

  private isLeftPressed = false;
  private isRightPressed = false;

  constructor() {
    this.init();
  }

  private init() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "ArrowLeft" && !this.isLeftPressed) {
        console.log("Left arrow key pressed");
        this.isLeftPressed = true;
      }
      if (event.code === "ArrowRight" && !this.isRightPressed) {
        console.log("Right arrow key pressed");
        this.isRightPressed = true;
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.code === "ArrowLeft") {
        console.log("Left arrow key released");
        this.isLeftPressed = false;
      }
      if (event.code === "ArrowRight") {
        console.log("Right arrow key released");
        this.isRightPressed = false;
      }
    });
  }
}
