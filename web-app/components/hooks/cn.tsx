/*************************
 * tiny classnames util so this file is drop-in ready.
 *************************/
export default function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
