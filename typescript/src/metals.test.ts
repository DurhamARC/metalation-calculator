import { MetalDataSet, Metal } from "./metals";

function checkIsCloseTo(value: number, expectedValue: number) {
  // Use IsCloseTo but to 10 significant figures
  let sigAfterDecimal = 10 - Math.floor(Math.log(expectedValue) / Math.log(10));
  // Don't go too deep (e.g. for 0-ish values)
  if (sigAfterDecimal > 15) {
    sigAfterDecimal = 15;
  }
  expect(value).toBeCloseTo(expectedValue, sigAfterDecimal);
}

test("calculateOccupancy", () => {
  const metalDataSet = new MetalDataSet();
  let occupancies = metalDataSet.calculateOccupancy();
  // Expected values are copied from original spreadsheet
  let expectedOccupancies: { [id: string]: number } = {
    mg: 0.000000029784992858,
    mn: 0.000000000028681845,
    fe: 0.000529510984138436,
    co: 0.919289903018121,
    ni: 0.000002026189990326,
    cu: 0.000055157394181087,
    zn: 0.0690918937636772,
    total: 0.988968521163783,
  };

  expect(occupancies.keys).toEqual(expectedOccupancies.keys);

  for (const id in expectedOccupancies) {
    checkIsCloseTo(occupancies[id], expectedOccupancies[id]);
  }

  // Change some values and check again
  metalDataSet.metals["mg"].affinity = 1e-6;
  metalDataSet.metals["ni"].affinity = 1000;
  metalDataSet.metals["mn"].bufferedMetalConcentration = 2.6e-8;
  metalDataSet.metals["co"].bufferedMetalConcentration = 1e-12;

  occupancies = metalDataSet.calculateOccupancy();
  // Expected values are copied from original spreadsheet
  expectedOccupancies = {
    mg: 0.99728535556569,
    mn: 0.000000000000009603,
    fe: 0.000017729517432279,
    co: 0.000012312164883527,
    ni: 0.0,
    cu: 0.000001846824732529,
    zn: 0.00231339098074691,
    total: 0.999630635053494,
  };

  expect(occupancies.keys).toEqual(expectedOccupancies.keys);

  for (const id in expectedOccupancies) {
    checkIsCloseTo(occupancies[id], expectedOccupancies[id]);
  }
});

test("metalValueRanges", () => {
  // Create a new metal
  const m = new Metal("MyNewlyDiscoveredMetal", "My", 1, 1);

  // Set affinity and bmc to extreme ends of valid values
  m.affinity = 1000;
  expect(m.affinity).toEqual(1000);
  m.affinity = 1e-30;
  expect(m.affinity).toBeCloseTo(1e-30, 32);

  m.bufferedMetalConcentration = 1000;
  expect(m.bufferedMetalConcentration).toEqual(1000);
  m.bufferedMetalConcentration = 1e-30;
  expect(m.bufferedMetalConcentration).toBeCloseTo(1e-30, 32);

  // Set affinity outside of range
  expect(() => (m.affinity = 1001)).toThrow(RangeError);
  expect(m.affinity).toBeCloseTo(1e-30, 32);
  expect(() => (m.affinity = 0)).toThrow(RangeError);
  expect(m.affinity).toBeCloseTo(1e-30, 32);
});

test("deltaGCalculation", () => {
  // Create a new metal
  const m = new Metal("MyNewlyDiscoveredMetal", "My", 1, 1);
  // Delta Gs should be 0
  expect(m.metalationDeltaG).toBeCloseTo(0);
  expect(m.intracellularAvailableDeltaG).toBeCloseTo(0);

  // Set affinity and check metalation delta G is updated
  m.affinity = 1000;
  expect(m.metalationDeltaG).toBeCloseTo(17.12, 2);
  expect(m.intracellularAvailableDeltaG).toBeCloseTo(0);

  // Set bmc and check intracellular available delta G is updated
  m.bufferedMetalConcentration = 3e-11;
  expect(m.metalationDeltaG).toBeCloseTo(17.12, 2);
  expect(m.intracellularAvailableDeltaG).toBeCloseTo(-60.06, 2);
});

test("disableEnableMetal", () => {
  //Create new metal
  const m = new Metal("MyNewlyDiscoveredMetal", "My", 1, 1);

  //Affinity should be 1000 and buffered Metal Concentration should stay the same
  m.switchOffMetal();
  expect(m.affinity).toEqual(1000);
  expect(m.bufferedMetalConcentration).toEqual(1);

  // affinity and buffered metal concentration should revert back to default values of 1,1
  m.resetValues();
  expect(m.affinity).toEqual(1);
  expect(m.bufferedMetalConcentration).toEqual(1);

  //set a new value for affinity and buffered Metal Concentration
  m.affinity = 1.8;
  m.bufferedMetalConcentration = 0.72;

  //Affinity should be 1000 and buffered Metal Concentration should revert back to the default value of 1
  m.switchOffMetal();
  expect(m.affinity).toEqual(1000);
  expect(m.bufferedMetalConcentration).toEqual(1);

  // affinity and buffered metal concentration should revert back to default values of 1,1
  m.resetValues();
  expect(m.affinity).toEqual(1);
  expect(m.bufferedMetalConcentration).toEqual(1);
});
