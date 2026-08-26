export class HistoryManager {
  constructor(maxSize = 50) {
    this.stack = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
  }

  init(initialContent) {
    this.stack = [initialContent];
    this.currentIndex = 0;
  }

  push(content) {
    // If we are identical to current index, ignore
    if (this.currentIndex >= 0 && this.stack[this.currentIndex] === content) {
      return;
    }

    // Truncate any redo branch
    this.stack = this.stack.slice(0, this.currentIndex + 1);

    this.stack.push(content);
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.currentIndex++;
    }
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.stack.length - 1;
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.stack[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.stack[this.currentIndex];
    }
    return null;
  }
}
