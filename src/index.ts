// Default styles
import "./styles.scss";

enum MoveEvent {
  hover = "mouseover",
  click = "onclick",
}

interface Rectangle {
  top: number;
  left: number;
  height: number;
  width: number;
}

class SmartHover extends HTMLElement {
  private transition: any = {};
  // Used to compare and determine if the contents of the container have changed so we can re-apply
  // our children listeners.
  private contents: string = "";
  private animateShadow: boolean = false;
  private moveEvent: MoveEvent = MoveEvent.hover;
  // This element is the one that will be moving over the child elements, the 'smart' hover
  private shadow!: HTMLElement;
  private shadowClass: string | null = null;
  private childrenCanChange: boolean = false;

  // Query selector to filter which children can be hovered
  query: string | null = null;
  // Query selector to define the initial position of the shadow
  initialChildQuery: string | null = null;
  // Current element under our smart hover
  active: HTMLElement | null = null;

  connectedCallback() {
    this.defineTransition();
    this.query = this.getAttribute("query-selector");
    this.initialChildQuery = this.getAttribute("initial-child-query");
    this.shadowClass = this.getAttribute("shadow-class");
    this.childrenCanChange = this.getAttribute("children-can-change") == "true";
    this.moveEvent = this.getMoveEvent();
    // Creates the shadow element that wil be used to hover over elements
    this.shadow = this.createShadow();
    this.containerListeners();
    this.childrenListeners();
    this.contents = this.innerText;
  }

  /**
   * Exposing  a resize function for use to user discretion
   */
  public resize() {
    if (this.active) {
      this.moveShadowToTarget(this.active);
    }
  }

  /**
   * Exposing to use at user discretion, this function queries for interactable
   * elements and removes/adds the necessary event listeners
   */
  public contentHasChanged() {
    this.childrenListeners();
  }

  /**
   * Using internally set timeouts makes sure to move the shadow element from one
   * target to another applying the proper animations
   */
  public moveShadowToTarget(target: HTMLElement) {
    this.shadow.classList.add("moving");
    let rect = this.getRectangle(target);
    this.applyPosition(rect, this.animateShadow);
    this.showShadow();
    this.active = target;
    this.animateShadow = true;
    setTimeout(() => {
      this.shadow.classList.remove("moving");
    }, this.transition.time);
  }

  /**
   * Defines the transition CSS property that is applied to the shadow element
   * this is based on attribute properties defined by user in the component
   */
  private defineTransition() {
    let transitionTimeAttr: string = this.getAttribute("transition-time") || "176";
    let transitionModeAttr: string = this.getAttribute("transition-mode") || "ease-in-out";
    let transitionPropsAttr: string | null = this.getAttribute("transition-props");
    this.transition.time = parseInt(transitionTimeAttr);

    let props: Array<string> = ["transform"];
    if (transitionPropsAttr) {
      props = transitionPropsAttr.split(",");
    }

    this.transition.string = "";
    props.forEach((prop) => {
      this.transition.string += `${prop} ${this.transition.time}ms ${transitionModeAttr}`;
    });
  }

  /**
   * Gets the defined attribute for the event that will trigger shadow
   * movement, defaults to hover if none is defined
   */
  private getMoveEvent(): MoveEvent {
    let attribute = this.getAttribute("move-event");
    switch (attribute) {
      case "click":
        return MoveEvent.click;
      case "hover":
      default:
        return MoveEvent.hover;
    }
  }

  /**
   * Created a tangible HTML element that will be the hover shadow for this
   * container
   */
  private createShadow() {
    let element: any = document.createElement("div");
    element.classList.add("smart-hover-shadow");
    if (this.shadowClass) {
      element.classList.add(this.shadowClass);
      element.classList.add('override-styles');
    }
    element.style.position = "absolute";
    element.style["pointer-events"] = "none";
    element.style["z-index"] = 99;
    element.style["top"] = 0;
    element.style["left"] = 0;
    element.style.transition = this.transition.string;
    return element;
  }

  /**
   * Applies the listeners to the container to handle things like updating the visual state
   * of the shadow, append or remove the shadow or re-apply event listeners to child elements
   * if the contents of the container has changed
   */
  private containerListeners() {
    switch (this.moveEvent) {
      case MoveEvent.click:
        this.setClickBehavior();
        break;
      case MoveEvent.hover:
      default:
        this.setHoverBehavior();
        break;
    }

    if (this.childrenCanChange) {
      this.addEventListener("mousemove", () => this.containerMouseMove());
    }
  }

  private setClickBehavior() {
    let attempts = 5;
    let currentAttempts = 0;
    this.attemptInit(attempts, currentAttempts);
  }

  private setHoverBehavior() {
    this.addEventListener("mouseenter", () => this.containerMouseEnter());
    this.addEventListener("mouseleave", () => this.containerMouseLeave());
    setTimeout(() => {
      // Append shadow if it contains hoverable elements
      if (this.getChildren().length > 0) this.safeAppendShadow();
    });
  }

  /**
   * Triggered when the container triggers mouseenter event
   * @param event DOM event
   */
   private containerMouseEnter() {
    let children = this.getChildren();
    // If we have no child we remove the shadow, also if we get to this event and we have a defined active element
    // it means that the element was removed on the spot and the mouse enter was triggered on the container
    if (children.length == 0 || (this.active && this.moveEvent == MoveEvent.hover)) {
      this.hideShadow(() => {
        this.safeRemoveShadow();
      });
      return;
    }

    this.safeAppendShadow();
  }

  /**
   * Triggered when the container triggers a mouseleave event
   * @param event DOM event
   */
  private containerMouseLeave() {
    this.hideShadow(() => {
      this.safeRemoveShadow();
    });
    this.animateShadow = false;
  }

  /**
   * Triggered when the container triggers the mousemove event
   * @param event DOM event
   */
  debounceMouseMove: number = 0;
  private containerMouseMove() {
    clearTimeout(this.debounceMouseMove);
    setTimeout(() => {
      // If the contents changed during our movements, we update our listeners
      if (this.contents != this.innerText) {
        this.childrenListeners();
      }
      this.contents = this.innerText;
    }, 100)
  }

  /**
   * Applies mouse events to container children, these events handle changing the shadow position and size
   */
  private childrenListeners() {
    switch (this.moveEvent) {
      case MoveEvent.click:
        this.setChildrenClickBehavior();
        break;
      case MoveEvent.hover:
      default:
        this.setChildrenHoverBehavior();
        break;
    }
  }

  private setChildrenClickBehavior() {
    let children: Array<any> = this.getChildren();
    children.forEach((child) => {
      child.removeEventListener("click", this.childEventHandler.bind(this), false);
      child.addEventListener("click", this.childEventHandler.bind(this), false);
    });
  }

  private setChildrenHoverBehavior() {
    let children: Array<any> = this.getChildren();
    children.forEach((child) => {
      child.removeEventListener("mouseenter", this.childEventHandler.bind(this), false);
      child.removeEventListener("mouseleave", this.childMouseLeave.bind(this), false);
      child.addEventListener("mouseenter", this.childEventHandler.bind(this), false);
      child.addEventListener("mouseleave", this.childMouseLeave.bind(this), false);
    });
  }

  /**
   * Triggered when a child node triggers either a mouseenter/click event, depending
   * on the defined move event behavior
   * @param event DOM event
   */
  private childEventHandler(event: any) {
    if (event && event.target) {
      this.moveShadowToTarget(event.target);
    }
  }

  /**
   * Triggered when a child node triggers a mouseleave event
   * @param event DOM event
   */
  private childMouseLeave() {
    this.hideShadow();
    this.active = null;
    let children = this.getChildren();
    if (children.length == 0) {
      this.hideShadow(() => {
        this.safeRemoveShadow();
      });
    }
  }


  /**
   * Applies only the style part to make the shadow visible
   */
  public showShadow() {
    this.shadow.style.opacity = "0";
    this.shadow.style.display = "block";
    this.shadow.style.opacity = "1";
  }

  /**
   * Applies only the style part of making the shadow invisible
   * @param callback Optional function executed once the element is done animating
   */
  public hideShadow(callback?: any) {
    this.shadow.style.opacity = "0";
    setTimeout(() => {
      if (callback) {
        callback();
      }
    }, this.transition.time);
  }

  /**
   * returns our container hoverable children, taking into account the query
   * selector (this.query) if defined
   */
  private getChildren(): Array<any> {
    return Array.from(this.query ? this.querySelectorAll(this.query) : this.children);
  }

  private getInitialChild() {
    if (this.initialChildQuery) {
      return this.querySelector(this.initialChildQuery);
    }
    return this.getChildren()[0];
  }

  /**
   * Takes a DOM native HTMLElement and returns a rectangle object holding
   * the top, left, height, width values
   * @param element Element that will be used to get the rectangle
   */
  private getRectangle(element: HTMLElement): Rectangle {
    return {
      top: element.offsetTop,
      left: element.offsetLeft,
      height: element.offsetHeight,
      width: element.offsetWidth,
    };
  }

  /**
   * Applies a rectangle position and sizing to the shadow element
   * @param rect Obejct holding top, left, height, width values
   * @param animate Determines if the rectangle changes will be animated
   */
  private applyPosition(rect: any, animate?: boolean) {
    // Get rid of the transition property if the animate property is set to false
    this.shadow.style.transition = animate ? this.transition : "unset";
    let shadowRect = this.getRectangle(this.shadow);
    if (shadowRect.height !== rect.height) this.shadow.style.height = rect.height + 'px';
    if (shadowRect.width !== rect.width) this.shadow.style.width = rect.width + 'px';
    this.shadow.style.transform = `translate(${rect.left}px, ${rect.top}px)`
    // Request animation frame so the chromium renderer applies our position with the proper transition
    // property, then we re-apply the transition to its default value
    window.requestAnimationFrame(() => {
      this.shadow.style.transition = this.transition.string;
    });
  }

  /**
   * Validates the existance of the shadow element inside the container before
   * appending it to avoid duplicates or unnecessary logic execution
   */
  private safeAppendShadow() {
    let shadow = this.querySelector(".smart-hover-shadow");
    if (!shadow) {
      this.append(this.shadow);
    }
  }

  /**
   * Validates the existance of the shadow element inside the container before
   * removing it to avoid throw exceptions if it doesn't exists
   */
  private safeRemoveShadow() {
    let shadow = this.querySelector(".smart-hover-shadow");
    if (shadow) {
      this.removeChild(this.shadow);
    }
  }

  /**
   * Exclusive for the click behavior, since when we use click behavior, the shadow must
   * be visible all the time
   */


  /**Recursive attempt to append and show the shadow making use of  setTimeout
   * mainly for angular projects that have a digest cycle
   */
  private attemptInit(attempts: number, currentAttempts: number) {
    if (currentAttempts >= attempts) {
      return;
    } else {
      setTimeout(() => {
        currentAttempts++;
        let initial = this.getInitialChild();
        let children = this.getChildren();
        if (children.length > 0 && (initial && this.sumRect(this.getRectangle(initial)) > 0)) {
          this.setChildrenClickBehavior();
          this.safeAppendShadow();
          this.moveShadowToTarget(initial);
        } else {
          this.attemptInit(attempts, currentAttempts);
        }
      }, 100);
    }
  }

  private sumRect(rect: Rectangle): number {
    return rect.top + rect.left + rect.height + rect.width;
  }
}
// Define web component
window.customElements.define("smart-hover", SmartHover);
