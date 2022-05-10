import { add } from "../index"

/**
 * Demonstrates how to add two numbers together.
 */
export function addTwoNumbers() {
  return add(3, 6)
}

/**
 * Add multiple sets of numbers together.
 */
export function addManyNumbers() {
  return add(add(3, 6), add(8, 12))
}
