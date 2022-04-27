describe("text is updated on toggle", async () => {
  // call render, pass in the fixture, and get back the queries, which are ready to use
  const { getCurrentText, clickButton, waitForText, waitForOnToggle } = render(
    <ToggleButton text="Hello World" onToggle={() => console.log("toggling")} />
  )
  // ensure the component renders correctly on load
  // this will error if the text isn't found
  await waitForText("Hello World")
  clickButton()
  // confirm the text updates after the clicking the button
  expect(getCurrentText()).toEqual("Toggled")

  // confirm that waitForToggle is called once with the right arguments
  const argsPassedToOnToggle = await waitForOnToggle(1)
  // it was initially false, it should be set to true after toggling
  expect(argsPassedToOnToggle).toEqual(["true"])
})
