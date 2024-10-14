export default class Vec {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add(v: Vec) {
    this.x += v.x
    this.y += v.y
  }
}
