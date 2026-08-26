/**
 * Inserts or replaces text at the exact cursor position in a textarea element
 */
export function insertTextAtCursor(textareaElement, currentText, textToInsert) {
  if (!textareaElement) {
    return currentText + textToInsert;
  }

  const startPos = textareaElement.selectionStart ?? currentText.length;
  const endPos = textareaElement.selectionEnd ?? currentText.length;

  const beforeText = currentText.substring(0, startPos);
  const afterText = currentText.substring(endPos);

  const updatedText = beforeText + textToInsert + afterText;

  // Schedule cursor repositioning after DOM update
  setTimeout(() => {
    textareaElement.focus();
    const newCursorPos = startPos + textToInsert.length;
    textareaElement.setSelectionRange(newCursorPos, newCursorPos);
  }, 10);

  return updatedText;
}

/**
 * Replaces a specific match range or substring in text
 */
export function replaceIconShortcode(fullText, oldShortcode, newShortcode) {
  if (!fullText || !oldShortcode) return fullText;
  return fullText.replace(oldShortcode, newShortcode);
}
