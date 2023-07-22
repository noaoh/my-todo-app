import {
  isUNIX, isMacOS, isLinux, isIOS, isAndroid,
} from 'get-os-name';

function getOsLineEnding() {
  // UNIX operating systems use '\n' to end a line
  // Windows and other operating systems use '\r\n' to end a line
  // This matters for the output of our todo.txt file
  if (isUNIX() || isMacOS() || isLinux() || isIOS() || isAndroid()) {
    return '\n';
  }
  return '\r\n';
}

// eslint-disable-next-line import/prefer-default-export
export { getOsLineEnding };
