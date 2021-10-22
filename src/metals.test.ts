import { all_metals, calculateOccupancy } from './metals';

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
     expect(occupancies[id]).toBeCloseTo(expectedOccupancies[id]);
  }

  // Change some values and check again
  all_metals["mg"].affinity = 1e-6;
  all_metals["ni"].affinity = 1000;
  all_metals["mn"].buffered_metal_concentration = 2.6e-8;
  all_metals["co"].buffered_metal_concentration = 1e-12;

  occupancies = calculateOccupancy();
  // Expected values are copied from original spreadsheet
  expectedOccupancies = {
    "mg": 0.997285259791523000,
    "mn": 0.000000096034876869,
    "fe": 0.000017729515729627,
    "co": 0.000012312163701130,
    "ni": 0.000000000000000000,
    "cu": 0.000001846824555169,
    "zn": 0.002313390758580710,
    "total": 0.999630635088966000,
  };

  expect(occupancies.keys).toEqual(expectedOccupancies.keys);

  for (var id in expectedOccupancies) {
     expect(occupancies[id]).toBeCloseTo(expectedOccupancies[id]);
  }
});
