/*************************
 * combinar clases condicionales de forma limpia.
 *************************/
export default function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
