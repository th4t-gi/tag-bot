const assert = require('assert');
const {parseTime} = require('./utils')


describe("Parsetime test", () => {
  it("is returning 1:10 when inputting 70000", () => {
    assert.equal(parseTime(70000), "1:10")
  })

  it("is returning 100:00:10 when inputting 360009000", () => {
    assert.equal(parseTime(360009000), "100:00:09")
  })

  it("is returning 0:26 when inputting 26000", () => {
    assert.equal(parseTime(26000), "0:26")
  })

  it("is returning 3:02:57 when inputting 10977000", () => {
    assert.equal(parseTime(10977000), "3:02:57")
  })
  it("is returning 3:20:57 when inputting 12057000", () => {
    assert.equal(parseTime(12057000), "3:20:57")
  })
})