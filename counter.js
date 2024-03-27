export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  //on mouse hover change the style of the element
  element.addEventListener('mouseover', () => {
    element.style.color = 'red'
  })
  //on mouse out change the style of the element
  element.addEventListener('mouseout', () => {
    element.style.color = '#ffffff'
  })
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
