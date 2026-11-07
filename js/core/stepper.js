export class Stepper {
  constructor(steps = []) {
    this.steps = steps;
    this.index = 0;
  }

  reset() {
    this.index = 0;
    return this.current();
  }

  current() {
    return this.steps[this.index] ?? null;
  }

  next() {
    if (this.index < this.steps.length - 1) {
      this.index += 1;
    }
    return this.current();
  }

  prev() {
    if (this.index > 0) {
      this.index -= 1;
    }
    return this.current();
  }

  length() {
    return this.steps.length;
  }
}
