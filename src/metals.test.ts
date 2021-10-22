import { all_metals, calculateOccupancy, Metal } from './metals';

function checkIsCloseTo(value: number, expectedValue: number) {
  // Use IsCloseTo but to 10 significant figures
  let sigAfterDecimal = 10 - Math.floor((Math.log(expectedValue)/Math.log(10)));
  // Don't go too deep (e.g. for 0-ish values)
  if (sigAfterDecimal > 15) {
    sigAfterDecimal = 15;
  }
  expect(value).toBeCloseTo(expectedValue, sigAfterDecimal);
}

test('calculateOccupancy', () => {
  var occupancies = calculateOccupancy();
  // Expected values are copied from original spreadsheet
  var expectedOccupancies: { [id: string]: number; } = {
    "mg": 0.000000029784992858,
    "mn": 0.000000000028681845,
    "fe": 0.000529510984138436,
    "co": 0.919289903018121000,
    "ni": 0.000002026189990326,
    "cu": 0.000055157394181087,
    "zn": 0.069091893763677200,
    "total": 0.988968521163783000,
  };

  expect(occupancies.keys).toEqual(expectedOccupancies.keys);

  for (var id in expectedOccupancies) {
    checkIsCloseTo(occupancies[id], expectedOccupancies[id]);
  }

  // Change some values and check again
  all_metals["mg"].affinity = 1e-6;
  all_metals["ni"].affinity = 1000;
  all_metals["mn"].buffered_metal_concentration = 2.6e-8;
  all_metals["co"].buffered_metal_concentration = 1e-12;

  occupancies = calculateOccupancy();
  // Expected values are copied from original spreadsheet
  expectedOccupancies = {
    "mg": 0.997285355565690000,
    "mn": 0.000000000000009603,
    "fe": 0.000017729517432279,
    "co": 0.000012312164883527,
    "ni": 0.000000000000000000,
    "cu": 0.000001846824732529,
    "zn": 0.002313390980746910,
    "total": 0.999630635053494000,
  };

  expect(occupancies.keys).toEqual(expectedOccupancies.keys);

  for (var id in expectedOccupancies) {
    checkIsCloseTo(occupancies[id], expectedOccupancies[id]);
  }
});

test('metalValueRanges', () => {
  // Create a new metal
  var m = new Metal("MyNewlyDiscoveredMetal", "My", 1, 1);

  // Set affinity and bmc to extreme ends of valid values
  m.affinity = 1000;
  expect(m.affinity).toEqual(1000);
  m.affinity = 1e-30;
  expect(m.affinity).toBeCloseTo(1e-30, 32);

  m.buffered_metal_concentration = 1000;
  expect(m.buffered_metal_concentration).toEqual(1000);
  m.buffered_metal_concentration = 1e-30;
  expect(m.buffered_metal_concentration).toBeCloseTo(1e-30, 32);

  // Set affinity outside of range
  expect(() => m.affinity = 1001).toThrow(RangeError);
  expect(m.affinity).toBeCloseTo(1e-30, 32);
  expect(() => m.affinity = 0).toThrow(RangeError);
  expect(m.affinity).toBeCloseTo(1e-30, 32);
});
